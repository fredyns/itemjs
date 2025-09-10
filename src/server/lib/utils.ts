import slugify from 'slugify'

export const createSlug = (title: string): string => {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  })
}

export const generateUniqueSlug = async (title: string, checkExists: (slug: string) => Promise<boolean>): Promise<string> => {
  let baseSlug = createSlug(title)
  let slug = baseSlug
  let counter = 1

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}
