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

const mostBlogs = (blogs) => {
  // handle empty lists
  if (blogs.length === 0) {
    return {}
  }
  // create an array for objects in the form: [{ author: "Robert Martin", blogs: 5 }, ...]
  // use this array to store authors and their number of blogs
  let numberOfBlogs = []
  // iterate through each blog in blogs
  for (const blog of blogs) {
    // look for author in numberOfBlogs array
    const authorIndex = numberOfBlogs.findIndex(entry => entry.author === blog.author)
    // if the author is in numberOfBlogs, add one to blogs count
    if (authorIndex !== -1) {
      numberOfBlogs[authorIndex].blogs ++
    // if author is not in numberOfBlogs, create a new object for author with blogs count of 1
    } else {
      numberOfBlogs.push(
        { author:blog.author,
          blogs:1
        }
      )
    }
  }
  // default sort order is ascending:
  numberOfBlogs.sort((a,b) => a.blogs - b.blogs)
  return numberOfBlogs[numberOfBlogs.length - 1]
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}
