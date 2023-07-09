const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }

  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (favorite, blog) => {
    if (favorite.likes > blog.likes) {
      return favorite
    } else {
      return blog
    }
  }

  if (blogs.length === 0) {
    return []
  } else if (blogs.length === 1) {
    return blogs[0]
  }


  return blogs.reduce(reducer, blogs[0])
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}
