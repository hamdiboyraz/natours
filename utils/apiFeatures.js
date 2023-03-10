class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // BUILD QUERY
    // 1A-Filtering
    const queryObj = { ...this.queryString }; // Object destructuring
    //console.log(this.queryString);

    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // extract excludeFields items from queryObj using foreach method and delete operator.
    // We use foreach because we don't want to get a new array
    excludeFields.forEach((el) => delete queryObj[el]);

    // 1B-Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    //const tours = await Tour.find(queryObj);
    // Tour.find() returns query
    // instead of using above code, we make first query then await the query.
    this.query = this.query.find(JSON.parse(queryStr));
    //let query = Tour.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // 2-Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      // query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // Default descending order
      //query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // 3- Field Limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      if (fields.includes('password'))
        throw new Error('Invalid fields selected');

      this.query = this.query.select(fields);
      //query.select(fields);
    } else {
      this.query = this.query.select('-__v');
      //query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4-Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // page=3&limit=10, 1-10->page 1; 11-20->page 2
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
