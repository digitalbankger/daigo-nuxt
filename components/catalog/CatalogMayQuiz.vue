<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import CatalogCardImage from '~/components/catalog/CatalogCardImage.vue'
import UiInput from '~/components/ui/UiInput.vue'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'
import { useAuthStore } from '~/stores/authStore'
import { useCartStore } from '~/stores/cartStore'
import { useAnalytics } from '~/composables/useAnalytics'
import { useYtm } from '~/composables/useYtm'
import { mayQuizService } from '~/services/mayQuizService'

type QuizStep = 'intro' | 'auth' | 'checking' | 'question' | 'newResult' | 'regularResult'
type ClientBranch = 'new' | 'regular'
type ResultKey = 'soft' | 'balance' | 'recovery'

type QuizOption = {
  label: string
  description: string
  points: number
}

type QuizQuestion = {
  title: string
  subtitle: string
  options: QuizOption[]
}

type BranchResult = {
  key: ResultKey
  min: number
  max: number
  title: string
  lead: string
  paragraphs: string[]
  offerTitle: string
  offerDescription: string
}

type QuizProduct = {
  id?: string | number
  uuid?: string | number
  product_id: string | number
  slug: string
  name: string
  subtitle?: string
  image: string
  price: number
  originalPrice?: number
  tag?: string
}

type BundleOffer = {
  id: string
  title: string
  button: string
  slugCandidates: string[]
  staticImage: string
  imageAlt: string
}

type StoredQuizResult = {
  branch: ClientBranch
  resultKey: ResultKey
  score: number
  answers: number[]
  completedAt: string
}

const REGULAR_CODE_PHRASE = 'Майский детокс'
const REGULAR_PHONE = '8 (800) 555-20-43'
const QUIZ_STORAGE_KEY = 'daigo_may_quiz_completed_result_v2'
const TOTAL_SLIDES_COUNT = 6

const auth = useAuthStore()
const cart = useCartStore()
const analytics = useAnalytics()
const ytm = useYtm()
const { isAuthenticated } = storeToRefs(auth)

const step = ref<QuizStep>('intro')
const clientBranch = ref<ClientBranch | null>(null)
const forcedResultKey = ref<ResultKey | null>(null)
const clientCheckError = ref('')
const questionIndex = ref(0)
const answers = ref<number[]>([])
const selectedOption = ref<number | null>(null)

const isLoadingProducts = ref(false)
const productsCache = ref<QuizProduct[]>([])
const bundleProducts = ref<Record<string, QuizProduct | null>>({})
const isAddingBundle = ref<string | null>(null)
const bundleAdded = ref<Record<string, boolean>>({})
const bundleError = ref<Record<string, string>>({})
const phraseCopied = ref(false)

const phone = ref('')
const agree = ref(false)
const agreeError = ref('')
const phoneError = ref('')
const codeError = ref('')
const authError = ref('')
const isAuthLoading = ref(false)
const codeDigits = ref<string[]>(['', '', '', ''])
const codeInputs = ref<HTMLInputElement[]>([])

const questions: QuizQuestion[] = [
  {
    title: 'Майские для тебя — это больше про:',
    subtitle: 'На майских организм в первую очередь реагирует не на еду, а на смену ритма — сон, время приёмов пищи, общую структуру дня',
    options: [
      { label: 'Сохранить свой ритм', description: 'обычно это сильно упрощает жизнь организму', points: 0 },
      { label: 'Немного отпустить контроль', description: 'иногда это и есть ощущение отдыха', points: 1 },
      { label: 'Полностью выйти из режима', description: 'я и есть режим, в такие моменты ритм собирается уже по ходу', points: 2 },
    ],
  },
  {
    title: 'Когда еда выходит из привычного режима, ты чаще:',
    subtitle: 'Когда привычный режим питания меняется, нагрузка возникает не только от состава еды, но и от её количества и ритма',
    options: [
      {
        label: 'Останавливаюсь, когда чувствую насыщение',
        description: 'тело обычно это подсказывает довольно точно',
        points: 0,
      },
      {
        label: 'Иногда «перебираю», но замечаю это',
        description: 'понимаешь в процессе, но останавливаешься уже не сразу',
        points: 1,
      },
      {
        label: 'Понимаю уже постфактум',
        description: 'когда уже сидишь и думаешь «зачем я это сделал»',
        points: 2,
      },
    ],
  },
  {
    title: 'Алкоголь в майские для тебя — это скорее:',
    subtitle: 'В праздничные периоды нагрузка часто определяется не самим фактом, а тем, как это встроено в день и повторяется ли',
    options: [
      {
        label: 'Осознанный выбор',
        description: 'когда решаешь сам, вечер остаётся под контролем',
        points: 0,
      },
      {
        label: 'Часть атмосферы',
        description: 'Важна тактика, а не стратегия, планы для слабых, все решает контекст',
        points: 1,
      },
      {
        label: 'Ну… майские же',
        description: 'в какой-то момент уже не совсем ясно, это выбор или продолжение ситуации',
        points: 2,
      },
    ],
  },
  {
    title: 'К концу майских ты чаще ощущаешь:',
    subtitle: 'Ощущение энергии — один из самых быстрых способов понять, как система справляется с нагрузкой',
    options: [
      {
        label: 'Что в целом восстановился',
        description: 'нагрузка была, но система как будто её переварила',
        points: 0,
      },
      {
        label: 'Что нужно немного прийти в себя',
        description: 'вроде уже вернулся, но ощущение ещё не до конца совпадает',
        points: 1,
      },
      {
        label: 'Что устал больше, чем отдохнул',
        description: 'формально отдых был, но по ощущениям он не сработал',
        points: 2,
      },
    ],
  },
  {
    title: 'После таких периодов ты скорее:',
    subtitle: 'Важна не только сама нагрузка, но и то, как быстро система возвращается к своему базовому состоянию',
    options: [
      {
        label: 'Помогаю себе быстрее вернуться в ритм',
        description: 'если чуть направить процесс, он идёт быстрее и ровнее',
        points: 0,
      },
      {
        label: 'Даю себе время, как получится',
        description: 'постепенно выравнивается, но без ощущения контроля',
        points: 1,
      },
      {
        label: 'Просто жду, пока само пройдёт',
        description: 'система восстанавливается, но дольше, чем хотелось бы',
        points: 2,
      },
    ],
  },
]

const newClientResults: BranchResult[] = [
  {
    key: 'soft',
    min: 0,
    max: 3,
    title: 'Всё прошло нормально. Почти',
    lead: '',
    paragraphs: [
      'Иногда кажется, что всё прошло нормально. Но по факту система просто тихо справилась с нагрузкой — и\nнакопила её.\n\nТы не выходишь из строя, но возвращаешься чуть дольше, чем мог бы.',
      'Здесь не нужно что-то исправлять. Важно не потерять то, что уже работает.',
      'Daigo — как раз про это: поддержать систему там, где она справляется сама,\nчтобы она быстрее вернулась к нормальной работе и не испытывала перегрузок\n\nНачнем становиться лучше вместе, купи два товара из списка, а третий мы дадим тебе в подарок!',
    ],
    offerTitle: '',
    offerDescription: '',
  },
  {
    key: 'balance',
    min: 4,
    max: 6,
    title: 'Живёшь в моменте, а последствия догоняют позже',
    lead: '',
    paragraphs: [
      'В процессе всё ок — ты просто живёшь майские как есть.\nНо через пару дней становится заметно, что система не до конца вывезла этот темп.\n\nНе критично, но уже не так легко, как могло бы быть.',
      'Это тот самый момент, который обычно пропускают.\nКогда ещё не «плохо», но уже нестабильно.',
      'Daigo включается именно здесь: помогает системе быстрее закрыть этот разрыв\nи не растягивать восстановление.\n\nНачнем становиться лучше вместе, купи два товара из списка, а третий мы дадим тебе в подарок!',
    ],
    offerTitle: '',
    offerDescription: '',
  },
  {
    key: 'recovery',
    min: 7,
    max: 10,
    title: 'Отдыхаешь активно, восстанавливаешься дольше',
    lead: '',
    paragraphs: [
      'Майские прожиты на максимум — но по ощущениям ты ещё не вернулся обратно.\n\nКак будто отдых закончился, а состояние — нет.',
      'Это не про ошибку. Это про то, что система не успела за нагрузкой.\nИ здесь важно не давить, а помочь ей собраться обратно.',
      'Daigo — как раз про этот момент: когда нужно не стимулировать, а восстановить нормальный ритм изнутри.\n\nНачнем становиться лучше вместе, купи два товара из списка, а третий мы дадим тебе в подарок!',
    ],
    offerTitle: '',
    offerDescription: '',
  },
]

const regularClientResults: BranchResult[] = [
  {
    key: 'soft',
    min: 0,
    max: 3,
    title: 'Всё прошло нормально. Почти',
    lead: '',
    paragraphs: [
      'Иногда кажется, что всё прошло нормально. Но по факту система просто тихо справилась с нагрузкой — и\nнакопила её.\n\nТы не выходишь из строя, но возвращаешься чуть дольше, чем мог бы.',
      'Здесь не нужно что-то исправлять. Важно не потерять то, что уже работает.',
      'Daigo — как раз про это: поддержать систему там, где она справляется сама,\nчтобы она быстрее вернулась к нормальной работе и не испытывала перегрузок',
    ],
    offerTitle: 'Специально для постоянных клиентов скидка 9% на корзину от двух продуктов по кодовой фразе',
    offerDescription: 'Для получения скидки пожалуйста свяжитесь с вашим личным менеджером, или позвоните по номеру телефона.',
  },
  {
    key: 'balance',
    min: 4,
    max: 6,
    title: 'Живёшь в моменте, а последствия догоняют позже',
    lead: '',
    paragraphs: [
      'В процессе всё ок — ты просто живёшь майские как есть.\nНо через пару дней становится заметно, что система не до конца вывезла этот темп.\n\nНе критично, но уже не так легко, как могло бы быть.',
      'Это тот самый момент, который обычно пропускают.\nКогда ещё не «плохо», но уже нестабильно.',
      'Daigo включается именно здесь: помогает системе быстрее закрыть этот разрыв\nи не растягивать восстановление.',
    ],
    offerTitle: 'Специально для постоянных клиентов скидка 9% на корзину от двух продуктов по кодовой фразе',
    offerDescription: 'Для получения скидки пожалуйста свяжитесь с вашим личным менеджером, или позвоните по номеру телефона.',
  },
  {
    key: 'recovery',
    min: 7,
    max: 10,
    title: 'Отдыхаешь активно, восстанавливаешься дольше',
    lead: '',
    paragraphs: [
      'Майские прожиты на максимум — но по ощущениям ты ещё не вернулся обратно.\n\nКак будто отдых закончился, а состояние — нет.',
      'Это не про ошибку. Это про то, что система не успела за нагрузкой.\nИ здесь важно не давить, а помочь ей собраться обратно.',
      'Daigo — как раз про этот момент: когда нужно не стимулировать, а восстановить нормальный ритм изнутри.',
    ],
    offerTitle: 'Специально для постоянных клиентов скидка 9% на корзину от двух продуктов по кодовой фразе',
    offerDescription: 'Для получения скидки пожалуйста свяжитесь с вашим личным менеджером, или позвоните по номеру телефона.',
  },
]

const bundleOffers: BundleOffer[] = [
  {
    id: 'daigo5',
    title: 'Месячный курс метабиотика Daigo 5',
    button: 'Положить в корзину',
    slugCandidates: ['metabiotik-daigo', 'metabiotik-daigo-5ml', 'metabiotik-daigo-5', 'daigo-5ml'],
    staticImage: '/images/catalog/res5ml.png',
    imageAlt: 'Месячный курс метабиотика Daigo 5',
  },
  {
    id: 'daigo10',
    title: 'Усиленный курс метабиотика Daigo 10',
    button: 'Положить в корзину',
    slugCandidates: ['metabiotik-daigo-10', 'metabiotik-daigo-10ml', 'daigo-10ml'],
    staticImage: '/images/catalog/res10ml.png',
    imageAlt: 'Усиленный курс метабиотика Daigo 10',
  },
  {
    id: 'aminobiotics',
    title: 'Полный курс Аминобиотиков',
    button: 'Положить в корзину',
    slugCandidates: ['daigo-dermic', 'aminobiotiki-daigo-dermic', 'daigo-brain', 'daigo-jointic'],
    staticImage: '/images/catalog/resdermic.png',
    imageAlt: 'Полный курс аминобиотиков',
  },
]

const totalQuestions = computed(() => questions.length)
const currentQuestion = computed(() => questions[questionIndex.value])
const progressLabel = computed(() => `${Math.min(questionIndex.value + 1, totalQuestions.value)}/${TOTAL_SLIDES_COUNT}`)
const score = computed(() => answers.value.reduce((sum, value) => sum + value, 0))
const isLastQuestion = computed(() => questionIndex.value === totalQuestions.value - 1)
const codeValue = computed(() => codeDigits.value.join(''))
const isCodeSent = computed(() => auth.isCodeSent && Boolean(auth.pendingPhone))
const phoneDigits = computed(() => phone.value.replace(/\D/g, ''))
const activeResults = computed(() => clientBranch.value === 'regular' ? regularClientResults : newClientResults)
const result = computed(() => {
  if (forcedResultKey.value) {
    return activeResults.value.find(item => item.key === forcedResultKey.value) || activeResults.value[0]
  }

  return activeResults.value.find(item => score.value >= item.min && score.value <= item.max) || activeResults.value[0]
})
const branchLabel = computed(() => clientBranch.value === 'regular' ? 'Постоянные' : 'Новые')

onMounted(async () => {
  const restored = await restoreCompletedQuiz()

  if (!restored && isAuthenticated.value) {
    cart.ensureLoaded?.().catch(() => {})
  }
})

watch(
  () => result.value.key,
  () => {
    if (step.value === 'newResult') loadBundleProducts()
  }
)

function resetState(keepStep = false) {
  if (!keepStep) step.value = 'intro'
  clientBranch.value = null
  forcedResultKey.value = null
  clientCheckError.value = ''
  questionIndex.value = 0
  answers.value = []
  selectedOption.value = null
  bundleProducts.value = {}
  bundleAdded.value = {}
  bundleError.value = {}
  phraseCopied.value = false
  authError.value = ''
  codeError.value = ''
}

async function startQuiz() {
  if (await restoreCompletedQuiz()) return

  resetState(true)
  analytics.reach('may_quiz_start')

  if (!isAuthenticated.value) {
    step.value = 'auth'
    return
  }

  await checkClientAndStartScenario()
}

async function checkClientAndStartScenario() {
  step.value = 'checking'
  clientCheckError.value = ''

  try {
    const isNew = await mayQuizService.checkIsNewClient(auth.token)
    clientBranch.value = isNew ? 'new' : 'regular'
  } catch (e) {
    console.warn('[CatalogMayQuiz] check client failed', e)
    clientBranch.value = 'new'
    clientCheckError.value = 'Не удалось определить тип клиента. Покажем сценарий для новых клиентов.'
  }

  forcedResultKey.value = null
  questionIndex.value = 0
  answers.value = []
  selectedOption.value = null
  step.value = 'question'
}

function selectOption(index: number) {
  selectedOption.value = index
}

async function nextQuestion() {
  if (selectedOption.value == null) return

  const optionIndex = selectedOption.value
  const option = currentQuestion.value.options[optionIndex]
  analytics.reach('may_quiz_question_answer', {
    client_type: clientBranch.value || 'unknown',
    question: questionIndex.value + 1,
    answer: optionIndex + 1,
    points: option.points,
  })
  answers.value[questionIndex.value] = option.points
  selectedOption.value = null

  if (!isLastQuestion.value) {
    questionIndex.value += 1
    return
  }

  await finishQuiz()
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>
  }
}

function sendYtmEvent(path: string, payload: Record<string, any> = {}) {
  if (!process.client) return

  window.dataLayer = window.dataLayer || []

  window.dataLayer.push({
    event: path,
    event_path: path,
    ...payload,
  })
}

async function finishQuiz() {
  forcedResultKey.value = result.value.key

  analytics.reach('may_quiz_complete', {
    client_type: clientBranch.value || 'unknown',
    result: result.value.key,
    score: score.value,
  })

  sendYtmEvent('/ym_events/quiz', {
    quiz_name: 'may_quiz',
    client_type: clientBranch.value || 'unknown',
    result: result.value.key,
    score: score.value,
  })

  saveCompletedQuiz()

  if (clientBranch.value === 'regular') {
    step.value = 'regularResult'
    return
  }

  step.value = 'newResult'
  await loadBundleProducts()
}

async function restoreCompletedQuiz(): Promise<boolean> {
  if (!process.client) return false

  const stored = readCompletedQuiz()
  if (!stored) return false

  clientBranch.value = stored.branch
  forcedResultKey.value = stored.resultKey
  answers.value = Array.isArray(stored.answers) ? stored.answers : []
  questionIndex.value = totalQuestions.value - 1
  selectedOption.value = null
  step.value = stored.branch === 'regular' ? 'regularResult' : 'newResult'

  if (stored.branch === 'new') {
    await loadBundleProducts()
  }

  return true
}

function readCompletedQuiz(): StoredQuizResult | null {
  if (!process.client) return null

  try {
    const raw = localStorage.getItem(QUIZ_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as StoredQuizResult
    if ((parsed.branch !== 'new' && parsed.branch !== 'regular') || !parsed.resultKey) return null

    return parsed
  } catch {
    return null
  }
}

function saveCompletedQuiz() {
  if (!process.client || !clientBranch.value) return

  const payload: StoredQuizResult = {
    branch: clientBranch.value,
    resultKey: result.value.key,
    score: score.value,
    answers: answers.value,
    completedAt: new Date().toISOString(),
  }

  try {
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore storage errors
  }
}

async function loadBundleProducts() {
  if (isLoadingProducts.value) return

  isLoadingProducts.value = true
  try {
    if (!productsCache.value.length) {
      const data = await $fetch<{ items: QuizProduct[] }>('/api/shop/products', {
        query: { page: 1, page_size: 9999, no_total: '1' },
      })
      productsCache.value = (data?.items || []) as QuizProduct[]
    }

    const nextProducts: Record<string, QuizProduct | null> = {}
    for (const offer of bundleOffers) {
      nextProducts[offer.id] = findProductBySlugs(offer.slugCandidates)
    }
    bundleProducts.value = nextProducts
  } catch (e) {
    console.warn('[CatalogMayQuiz] products load failed', e)
  } finally {
    isLoadingProducts.value = false
  }
}

function findProductBySlugs(slugs: string[]): QuizProduct | null {
  const normalizedSlugs = slugs.map(item => item.toLowerCase())
  return productsCache.value.find(product => normalizedSlugs.includes(String(product.slug || '').toLowerCase())) || null
}

function validateAgree() {
  agreeError.value = agree.value ? '' : 'Нужно согласиться с условиями'
}

function validatePhone() {
  phoneError.value = phoneDigits.value.length >= 11 ? '' : 'Введите телефон полностью'
}

function validateCode() {
  codeError.value = codeValue.value.length === 4 ? '' : 'Введите 4 цифры'
}

async function submitPhone() {
  authError.value = ''
  validatePhone()
  validateAgree()
  if (phoneError.value || agreeError.value) return

  isAuthLoading.value = true
  try {
    await auth.requestCode({ phone: phone.value })
    await nextTick()
    focusCodeInput(0)
  } catch (e: any) {
    authError.value = e?.message || 'Не удалось отправить код'
  } finally {
    isAuthLoading.value = false
  }
}

async function submitCode() {
  authError.value = ''
  validateCode()
  validateAgree()
  if (codeError.value || agreeError.value) return

  isAuthLoading.value = true
  try {
    await auth.confirmCode(codeValue.value, '')
    analytics.reach('may_quiz_auth_success')
    await checkClientAndStartScenario()
  } catch (e: any) {
    authError.value = e?.message || 'Не удалось подтвердить код'
  } finally {
    isAuthLoading.value = false
  }
}

async function resendCode() {
  authError.value = ''
  try {
    await auth.resendCode()
  } catch (e: any) {
    authError.value = e?.message || 'Не удалось отправить код повторно'
  }
}

function changePhone() {
  auth.isCodeSent = false
  codeDigits.value = ['', '', '', '']
  codeError.value = ''
}

function setCodeInputRef(el: HTMLInputElement | null, index: number) {
  if (el) codeInputs.value[index] = el
}

function focusCodeInput(index: number) {
  codeInputs.value[index]?.focus()
}

function handleCodeInput(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/\D/g, '')

  if (!value) {
    codeDigits.value[index] = ''
    return
  }

  if (value.length > 1) {
    const chars = value.slice(0, 4).split('')
    for (let i = 0; i < 4; i += 1) codeDigits.value[i] = chars[i] || ''
    focusCodeInput(Math.min(chars.length, 4) - 1)
    return
  }

  codeDigits.value[index] = value
  if (index < 3) focusCodeInput(index + 1)
}

function handleCodeKeydown(event: KeyboardEvent, index: number) {
  const input = event.target as HTMLInputElement
  if (event.key === 'Backspace' && !input.value && index > 0) {
    codeDigits.value[index - 1] = ''
    focusCodeInput(index - 1)
    event.preventDefault()
  }

  if (event.key === 'ArrowLeft' && index > 0) {
    focusCodeInput(index - 1)
    event.preventDefault()
  }

  if (event.key === 'ArrowRight' && index < 3) {
    focusCodeInput(index + 1)
    event.preventDefault()
  }
}

async function copyRegularPhrase() {
  phraseCopied.value = false
  try {
    await navigator.clipboard.writeText(REGULAR_CODE_PHRASE)
    phraseCopied.value = true
    analytics.reach('may_quiz_regular_phrase_copy', { result: result.value.key })
    window.setTimeout(() => { phraseCopied.value = false }, 1600)
  } catch {
    phraseCopied.value = false
  }
}

function getProductId(product: QuizProduct) {
  return String(product.product_id || product.id || product.uuid || '')
}

function getProductUuid(product: QuizProduct) {
  return String(product.uuid || product.product_id || product.id || '')
}

async function addBundleToCart(offer: BundleOffer) {
  const product = bundleProducts.value[offer.id]
  if (!product || isAddingBundle.value) return

  const productId = getProductId(product)
  const uuid = getProductUuid(product)

  if (!productId || !uuid) {
    bundleError.value = { ...bundleError.value, [offer.id]: 'У товара не найден product_id или uuid' }
    return
  }

  bundleError.value = { ...bundleError.value, [offer.id]: '' }
  isAddingBundle.value = offer.id

  analytics.reach('may_quiz_add_to_cart_click', {
    client_type: clientBranch.value || 'new',
    result: result.value.key,
    offer: offer.id,
    product_id: productId,
    uuid,
  })

  try {
    await mayQuizService.apply2Plus1({ product_id: productId, uuid }, auth.token)
    await cart.loadCart?.()

    bundleAdded.value = { ...bundleAdded.value, [offer.id]: true }
    analytics.reach('may_quiz_add_to_cart', {
      client_type: clientBranch.value || 'new',
      result: result.value.key,
      offer: offer.id,
      product_id: productId,
      uuid,
    })
    ytm.addToCart({
      id: productId,
      name: product.name,
      price: Number(product.price) || 0,
      quantity: 3,
      url: `/catalog/${product.slug}`,
      image_url: product.image,
    }, 'may_quiz')
  } catch (e: any) {
    bundleError.value = {
      ...bundleError.value,
      [offer.id]: e?.data?.message || e?.message || 'Не удалось положить набор в корзину',
    }
  } finally {
    isAddingBundle.value = null
  }
}
</script>

<template>
  <section class="catalog-may-quiz w-full !font-haido" aria-label="Майский квиз Daigo">
    <div
      class="quiz-card text-white"
      :class="{ 'quiz-card--intro': step === 'intro' }"
    >
      <div v-if="step === 'intro'" class="quiz-layer quiz-intro">
        <div>
          <h2 class="quiz-title">
            Как майские праздники влияют на твою систему?
          </h2>
          <p class="quiz-subtitle fs-normal max-w-[90%] mt-3">
            Пройди короткий квиз и получи уникальное предложение по праздничной поддержке организма
          </p>
        </div>

        <button type="button" class="quiz-button" @click="startQuiz">
          Пройти квиз
        </button>
      </div>

      <div v-else-if="step === 'auth'" class="quiz-layer quiz-auth">
        <h2 class="quiz-title">
          Для того, чтобы мы могли вам сделать наилучшее персональное предложение
        </h2>
        <p class="quiz-subtitle mt-4">
          пожалуйста, авторизуйтесь на сайте
        </p>

        <form v-if="!isCodeSent" class="sm:max-w-[50%] mt-7 space-y-4" @submit.prevent="submitPhone">
          <UiInput
            v-model="phone"
            name="may_quiz_phone"
            type="tel"
            inputmode="tel"
            mask="ru-phone"
            autocomplete="tel"
            placeholder="+7 (___) ___-__-__"
            :error="phoneError"
            background="bg-transparent"
            @blur="validatePhone"
            @enter="submitPhone"
          />

          <div class="space-y-1 rounded-2xl bg-white/5 p-3 backdrop-blur">
            <BaseCheckbox v-model="agree" :error="!!agreeError" @click="validateAgree">
              <span class="text-xs leading-relaxed text-white/75">
                Я согласен(на) с
                <NuxtLink to="/privacy" class="underline underline-offset-2">политикой конфиденциальности</NuxtLink>
                и
                <NuxtLink to="/soglasie-na-obrabotku-personalnykh-dannykh" class="underline underline-offset-2">обработкой персональных данных</NuxtLink>.
              </span>
            </BaseCheckbox>
            <p v-if="agreeError" class="text-xs text-red-200">{{ agreeError }}</p>
          </div>

          <button type="submit" class="quiz-button quiz-button-wide" :disabled="isAuthLoading">
            {{ isAuthLoading ? 'Отправляем код…' : 'Получить код по СМС' }}
          </button>
        </form>

        <form v-else class="sm:max-w-[50%] mt-7 space-y-4" @submit.prevent="submitCode">
          <p class="text-sm text-white/75">{{ auth.deliveryHint }}</p>

          <div class="flex items-center gap-3">
            <input
              v-for="(_, index) in 4"
              :key="index"
              :ref="el => setCodeInputRef(el as HTMLInputElement, index)"
              :value="codeDigits[index]"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="1"
              class="h-14 w-14 rounded-xl border border-white/35 bg-white/95 text-center text-xl text-black outline-none transition focus:border-white focus:ring-2 focus:ring-white/50"
              @input="event => handleCodeInput(event, index)"
              @keydown="event => handleCodeKeydown(event, index)"
            />
          </div>
          <p v-if="codeError" class="text-sm text-red-200">{{ codeError }}</p>

          <button type="submit" class="quiz-button quiz-button-wide" :disabled="isAuthLoading">
            {{ isAuthLoading ? 'Проверяем…' : 'Продолжить квиз' }}
          </button>

          <div class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/75">
            <button type="button" class="underline underline-offset-4 hover:text-white" @click="changePhone">
              Изменить номер
            </button>
            <button
              type="button"
              class="underline underline-offset-4 hover:text-white disabled:opacity-50"
              :disabled="auth.resendLeft > 0"
              @click="resendCode"
            >
              Получить код звонком<span v-if="auth.resendLeft > 0"> ({{ auth.resendLeft }})</span>
            </button>
          </div>
        </form>

        <p v-if="authError" class="mt-4 rounded-xl bg-red-500/20 px-4 py-3 text-sm text-red-100">
          {{ authError }}
        </p>
      </div>

      <div v-else-if="step === 'checking'" class="quiz-layer flex flex-col justify-center gap-4">
        <p class="quiz-kicker">Почти готово</p>
        <h2 class="quiz-title">
          Подбираем подходящий сценарий
        </h2>
        <p class="quiz-subtitle">
          Проверяем информацию и готовим персональный квиз.
        </p>
      </div>

      <div v-else-if="step === 'question'" class="quiz-layer quiz-question">

        <h2 class="quiz-title max-w-[858px]">
          {{ currentQuestion.title }}
        </h2>
        <p class="quiz-subtitle mt-4 max-w-[858px]">
          {{ currentQuestion.subtitle }}
        </p>

        <div class="quiz-options">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="option.label"
            type="button"
            class="quiz-option"
            :class="{ 'is-selected': selectedOption === index }"
            @click="selectOption(index)"
          >
            <span class="quiz-radio"><span /></span>
            <span class="quiz-option-text">
              <span class="quiz-option-title">{{ option.label }}</span>
              <span class="quiz-option-description">{{ option.description }}</span>
            </span>
          </button>
        </div>

        <button
          type="button"
          class="quiz-button !mt-12"
          :disabled="selectedOption === null"
          @click="nextQuestion"
        >
          {{ isLastQuestion ? `Узнать о себе ${progressLabel}` : `Следующий вопрос ${progressLabel}` }}
        </button>
      </div>

      <div v-else-if="step === 'regularResult'" class="quiz-layer quiz-result">
        <h2 class="quiz-result-title">
          {{ result.title }}
        </h2>
        <div class="quiz-result-copy">
          <p class="quiz-result-lead">{{ result.lead }}</p>
          <p v-for="paragraph in result.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </div>

        <div class="regular-offer-panel">
          <div>
            <p class="regular-offer-title">{{ result.offerTitle }}</p>
            <p class="regular-offer-text">
              {{ result.offerDescription }}
              <a :href="`tel:${REGULAR_PHONE.replace(/\D/g, '')}`" class="underline underline-offset-4">{{ REGULAR_PHONE }}</a>
            </p>
          </div>
          <button type="button" class="regular-code-button" @click="copyRegularPhrase">
            {{ phraseCopied ? 'Скопировано' : REGULAR_CODE_PHRASE }}
          </button>
        </div>
      </div>

      <div v-else class="quiz-layer quiz-result new-result">
        <h2 class="quiz-result-title">
          {{ result.title }}
        </h2>
        <div class="quiz-result-copy">
          <p class="quiz-result-lead">{{ result.lead }}</p>
          <p v-for="paragraph in result.paragraphs" :key="paragraph">{{ paragraph }}</p>
          <p class="quiz-result-offer-line">{{ result.offerTitle }}</p>
        </div>

        <div class="bundle-panel !mt-2">
          <div v-if="isLoadingProducts" class="flex min-h-[160px] items-center justify-center text-sm text-white/75">
            Подбираем наборы…
          </div>

          <div v-else class="bundle-grid">
            <article v-for="offer in bundleOffers" :key="offer.id" class="bundle-offer">
              <div class="bundle-images">
                <NuxtLink
                  v-if="bundleProducts[offer.id]"
                  :to="`/catalog/${bundleProducts[offer.id]?.slug}`"
                  class="bundle-image-link"
                >
                  <img
                    :src="offer.staticImage"
                    :alt="offer.imageAlt"
                    class="bundle-image"
                    width="220"
                    height="120"
                    loading="lazy"
                    decoding="async"
                  >
                </NuxtLink>

                <div v-else class="bundle-placeholder">
                  Нет товара
                </div>
              </div>

              <p class="bundle-title">{{ offer.title }}</p>
              <button
                type="button"
                class="bundle-button"
                :disabled="!bundleProducts[offer.id] || isAddingBundle === offer.id || bundleAdded[offer.id]"
                @click="addBundleToCart(offer)"
              >
                <span v-if="bundleAdded[offer.id]">В корзине</span>
                <span v-else-if="isAddingBundle === offer.id">Добавляем…</span>
                <span v-else>{{ offer.button }}</span>
              </button>
              <p v-if="bundleError[offer.id]" class="mt-2 text-xs text-red-100">{{ bundleError[offer.id] }}</p>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.catalog-may-quiz {
  text-align: left;
  --quiz-radius: 20px;
  font-family: 'TG Haido Grotesk', 'TGHaidoGrotesk', 'Golos Text', system-ui, sans-serif;
}
.fs-normal {
  font-style: normal !important;
}
.quiz-card {
  position: relative;
  min-height: 615px;
  overflow: hidden;
  border-radius: var(--quiz-radius);
  background-image:
    url('/images/catalog/bg.jpg');
  background-size: cover;
  background-position: center;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
}

.quiz-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 76% 14%, rgba(255, 255, 255, 0.22), transparent 24%);
  pointer-events: none;
}

.quiz-card::after {
  content: '';
  position: absolute;
  inset: 0;
  backdrop-filter: blur(3px);
  pointer-events: none;
}

.quiz-layer {
  position: relative;
  z-index: 1;
  min-height: 503px;
  padding: 35px;
  max-width: 82%;
}
.quiz-layer.quiz-intro {
  max-width: 100%;
}

.quiz-card--intro {
  height: 240px;
  min-height: 240px;
}

.quiz-card--intro .quiz-layer {
  height: 240px;
  min-height: 240px;
  padding: 28px 35px;
}

.quiz-card--intro .quiz-intro {
  min-height: 240px;
}

.quiz-intro {
  display: flex;
  text-align: left;
  flex-direction: column;
  justify-content: center;
}

.quiz-kicker,
.quiz-branch-label {
  margin-bottom: 14px;
  color: rgba(255, 255, 255, 0.66);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.quiz-title {
  color: #fff;
  font-size: clamp(20px, 3vw, 32px);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}

.quiz-subtitle {
  color: rgba(255, 255, 255, 0.94);
  font-size: clamp(16px, 2vw, 20px);
  font-style: italic;
  font-weight: 400;
  line-height: 1.3;
}

.quiz-options {
  display: grid;
  gap: 20px;
  margin-top: 42px;
}

.quiz-option {
  display: flex;
  align-items: flex-start;
  padding: 5px 10px;
  padding-bottom: 10px;
  gap: 20px;
  width: 100%;
  max-width: 858px;
  color: #fff;
  text-align: left;
  border-radius: 14px;
  outline: none;
  transition: transform 0.18s ease, background 0.18s ease;
}

.quiz-option:hover,
.quiz-option.is-selected {
  background: rgba(255, 255, 255, 0.06);
  transform: translateX(4px);
}

.quiz-radio {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  margin-top: 2px;
  overflow: hidden;

  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;

  background:
    radial-gradient(
      circle at 22% 20%,
      rgba(255, 255, 255, 0.34) 0%,
      rgba(255, 255, 255, 0.14) 20%,
      rgba(255, 255, 255, 0) 45%
    ),
    radial-gradient(
      circle at 78% 82%,
      rgba(255, 255, 255, 0.22) 0%,
      rgba(255, 255, 255, 0.08) 18%,
      rgba(255, 255, 255, 0) 42%
    ),
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.16) 0%,
      rgba(217, 217, 217, 0.20) 45%,
      rgba(255, 255, 255, 0.08) 100%
    );

  box-shadow:
    inset 1px 1px 1.5px rgba(255, 255, 255, 0.28),
    inset -1px -1px 2px rgba(255, 255, 255, 0.10),
    0 2px 6px rgba(0, 0, 0, 0.08);

  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.quiz-radio span {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: transparent;
  transition: background 0.18s ease;
}

.quiz-option.is-selected .quiz-radio span {
  background: #fff;
}

.quiz-option-title {
  display: block;
  color: #fff;
  font-size: clamp(18px, 2.4vw, 24px);
  font-weight: 400;
  line-height: 1.3;
}

.quiz-option-description {
  display: block;
  color: rgba(255, 255, 255, 0.92);
  font-size: clamp(15px, 2vw, 20px);
  font-style: italic;
  font-weight: 400;
  line-height: 1.3;
}

.quiz-button {
  display: inline-flex;
    justify-content: center;
    width: min(300px, 100%);
    min-height: 54px;
    padding: 10px 24px;
    border: 1px solid rgba(255, 255, 255, 0.86);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    color: #fff;
    font-size: 20px;
    font-weight: 400;
    transition: background 0.18s ease, color 0.18s ease, opacity 0.18s ease;
    margin-top: 1.4rem;
}

.quiz-button:hover:not(:disabled) {
  background: #fff;
  color: #1f2419;
}

.quiz-button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.quiz-button-wide {
  width: 100%;
  font-size: 16px;
}

.quiz-result {
  display: flex;
  flex-direction: column;
}

.quiz-result-title {
  max-width: 858px;
  color: #fff;
  font-size: clamp(20px, 2.4vw, 20px);
  font-weight: 500;
  line-height: 1.2;
}

.quiz-result-copy {
  max-width: 880px;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.95);
  font-size: clamp(15px, 1.7vw, 16px);
  font-style: italic;
  font-weight: 400;
  line-height: 1.3;
}

.quiz-result-copy p + p {
  margin-top: 18px;
}

.quiz-result-lead,
.quiz-result-copy p:nth-child(3) {
  font-style: italic;
  font-weight: 500;
}
.quiz-result-copy p:nth-child(3) {
    font-size: clamp(20px, 2.4vw, 20px);
    color: #fff;
    font-style: normal;
    font-weight: 500;
    line-height: 1.2;
}
.quiz-result-offer-line {
  margin-top: 20px !important;
}

.bundle-panel {
  position: relative;
  width: 100%;
  margin-top: auto;
  min-height: 211px;
  padding: 20px;
  overflow: hidden;

  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 16px;

  background:
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.18) 0%,
      rgba(255, 255, 255, 0.07) 42%,
      rgba(255, 255, 255, 0.04) 100%
    );

  backdrop-filter: blur(8px) saturate(115%);
  -webkit-backdrop-filter: blur(8px) saturate(115%);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 -10px 24px rgba(255, 255, 255, 0.035),
    0 12px 28px rgba(0, 0, 0, 0.12);
}

.regular-offer-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 24px;
  padding: 22px 24px;
}

.regular-offer-title {
  max-width: 520px;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.18;
}

.regular-offer-text {
  max-width: 620px;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
  font-style: italic;
  line-height: 1.28;
}

.regular-code-button,
.bundle-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
  font-size: 15px;
  line-height: 1.2;
  transition: background 0.18s ease, color 0.18s ease, opacity 0.18s ease;
}

.regular-code-button {
  min-width: 210px;
  padding: 8px 24px;
}

.regular-code-button:hover,
.bundle-button:hover:not(:disabled) {
  background: #fff;
  color: #1f2419;
}

.bundle-panel {
  min-height: 211px;
  padding: 20px;
}

.bundle-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.bundle-offer {
  min-width: 0;
}

.bundle-images {
  display: flex;
  align-items: start;
  min-height: 82px;
}

.bundle-image-link {
  display: block;
  flex: 0 0 auto;
}

.bundle-image {
  height: 93px;
  object-fit: contain;
}

.bundle-plus {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  color: #fff;
  font-size: 28px;
  font-weight: 500;
  line-height: 1;
}

.bundle-title {
  max-width: 220px;
  margin-top: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.22;
}

.bundle-button {
  min-width: 150px;
  margin-top: 10px;
  padding: 8px 14px;
  font-size: 14px;
}

.bundle-button:disabled {
  cursor: not-allowed;
  opacity: 0.52;
}

.bundle-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 72px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.62);
  font-size: 13px;
}
.quiz-result-copy p {
  white-space: pre-line;
}
@media (max-width: 1023px) {
  .quiz-card,
  .quiz-layer {
    min-height: 480px;
  }

  .bundle-grid {
    grid-template-columns: 1fr;
  }

  .bundle-offer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .regular-offer-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .quiz-card,
  .quiz-layer {
    min-height: auto;
  }

  .quiz-layer {
    padding: 24px 18px;
    max-width: 100%;
  }

  .quiz-options {
    gap: 22px;
    margin-top: 32px;
  }

  .quiz-option {
    gap: 14px;
  }

  .quiz-radio {
    flex-basis: 24px;
    width: 24px;
    height: 24px;
  }

  .quiz-button {
    font-size: 16px;
  }

  .bundle-panel,
  .regular-offer-panel {
    margin-top: 28px;
  }



  .bundle-plus {
    padding: 0 5px;
    font-size: 22px;
  }
}
</style>
