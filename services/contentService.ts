import type { Banner, Story, Review } from '~/types/content'

const baseURL = '/api/content'

export const fetchBanner = () =>
  $fetch<Banner>(`${baseURL}/banner`)

export const fetchStories = () =>
  $fetch<Story[]>(`${baseURL}/stories`)

export const fetchReviews = () =>
  $fetch<Review[]>(`${baseURL}/reviews`)
