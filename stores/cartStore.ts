import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from '~/stores/authStore'

/**
 * Описание товара в корзине. Поддерживаются дополнительные поля для
 * отображения цены до скидки, подзаголовка и превью изображения.
 */
export interface CartItem {
  id: number
  title: string
  subtitle?: string
  price: number
  oldPrice?: number
  quantity: number
  image: string
  tag?: string
}

/**
 * Описание подарка (бесплатного товара), который отображается в корзине.
 */
export interface CartGift {
  id: number
  title: string
  image: string
  note?: string
}

/**
 * Описание промо-уведомления. Бэкенд должен возвращать объект этого
 * типа, если есть активная акция для товаров в корзине. См. комментарии
 * в server/api/cart/get.ts для формата ответа.
 */
export interface PromoNotice {
  type?: 'discount' | 'code' | '2+1'
  discount?: number
  couponName?: string
  productName: string
  endTime: string
}

/**
 * Поля формы для неавторизованного пользователя. Используются в правой
 * части корзины для заполнения контактов перед оформлением заказа.
 */
export interface UserForm {
  fullName: string
  phone: string
  city: string
}

/**
 * Хранилище корзины. Содержит список товаров, подарков, информацию
 * об активной акции (promoNotice) и количество дней до окончания акции.
 * Так же хранит форму для неавторизованных пользователей.
 */
export const useCartStore = defineStore('cart', () => {
  const auth = useAuthStore()
  // Основные данные корзины
  const items = ref<CartItem[]>([])
  const gifts = ref<CartGift[]>([])
  const promoNotice = ref<PromoNotice | null>(null)
  // Локальное хранилище для гостя
  const localCart = ref<CartItem[]>([])
  // Форма для неавторизованного пользователя
  const userForm = ref<UserForm>({ fullName: '', phone: '', city: '' })

  /**
   * Вычисление остатка дней до окончания акции. Считаем целое число дней,
   * округляя вверх. Если акция закончилась или не определена — возвращаем null.
   */
  const daysLeft = computed(() => {
    if (!promoNotice.value?.endTime) return null
    const end = new Date(promoNotice.value.endTime)
    const now = new Date()
    const diffMs = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : null
  })

  /**
   * Флаг авторизации перенаправляется из authStore. Используем его
   * непосредственно в шаблонах для упрощения условий.
   */
  const isAuthenticated = computed(() => auth.isAuthenticated)

  /**
   * Загрузка корзины с сервера. В зависимости от того, авторизован ли
   * пользователь, отправляем запрос на бэкенд или берём данные из localStorage.
   * Если API возвращает promo_notice как объект — сохраняем в promoNotice.
   */
  async function loadCart() {
    if (isAuthenticated.value) {
      const { data } = await useFetch('/api/cart/get')
      // data.value может быть undefined в случае ошибки
      if (data.value) {
        items.value = data.value.items || []
        gifts.value = data.value.gifts || []
        // Поскольку useFetch сериализует объекты, приведём promo_notice к PromoNotice
        promoNotice.value = data.value.promo_notice as PromoNotice || null
      }
    } else {
      // Для гостя: загружаем данные из localStorage (SSR-safe проверка)
      // Полный механизм localStorage должен быть реализован в хуках onMounted
      // Здесь просто инициализируем массив на основании localCart
      items.value = localCart.value || []
      promoNotice.value = null
    }
  }

  /**
   * Добавление товара в корзину. При гостевой сессии сохраняет в localCart,
   * при авторизованном пользователе отправляет запрос на бэкенд.
   */
  async function addToCart(item: CartItem) {
    if (isAuthenticated.value) {
      await $fetch('/api/cart/add', { method: 'POST', body: item })
      // обновляем корзину после добавления
      await loadCart()
    } else {
      const existing = items.value.find(i => i.id === item.id)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        items.value.push({ ...item })
      }
      saveToLocal()
    }
  }

  /**
   * Обновление количества товара. Количество может быть уменьшено или увеличено.
   */
  async function updateItem(id: number, quantity: number) {
    if (quantity <= 0) {
      // Удаляем товар, если количество становится 0 или меньше
      await removeItem(id)
      return
    }
    if (isAuthenticated.value) {
      await $fetch('/api/cart/update', { method: 'POST', body: { id, quantity } })
    } else {
      const item = items.value.find(i => i.id === id)
      if (item) item.quantity = quantity
      saveToLocal()
    }
  }

  /**
   * Удаление товара из корзины.
   */
  async function removeItem(id: number) {
    if (isAuthenticated.value) {
      await $fetch('/api/cart/remove', { method: 'POST', body: { id } })
    } else {
      items.value = items.value.filter(i => i.id !== id)
      saveToLocal()
    }
  }

  /**
   * Очистка корзины полностью. Сбрасываем товары, подарки и промо-уведомление.
   */
  function clearCart() {
    items.value = []
    gifts.value = []
    promoNotice.value = null
    if (!isAuthenticated.value) {
      localCart.value = []
    }
  }

  /**
   * Сохранение корзины в localStorage. Необходимо вызвать этот метод
   * после любого изменения для гостевой корзины.
   */
  function saveToLocal() {
    localCart.value = items.value
    // На клиенте можно записать в window.localStorage
    if (process.client) {
      try {
        window.localStorage.setItem('guest-cart', JSON.stringify(localCart.value))
      } catch (e) {
        console.warn('Не удалось сохранить корзину в localStorage', e)
      }
    }
  }

  return {
      items,
      gifts,
      promoNotice,
      daysLeft,
      userForm,
      isAuthenticated,
      loadCart,
      addToCart,
      updateItem,
      removeItem,
      clearCart,
      saveToLocal,
  }
})