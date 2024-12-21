import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    icon: String,
    color: String,
    featuredImage: String
  }
}, {
  timestamps: true
});

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: String,
  count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    maxlength: 500
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  metadata: {
    readTime: Number,
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  seo: {
    title: String,
    description: String,
    keywords: [String],
    ogImage: String
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }]
}, {
  timestamps: true
});

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  type: {
    type: String,
    enum: ['pdf', 'video', 'audio', 'infographic', 'worksheet'],
    required: true
  },
  description: String,
  content: {
    url: {
      type: String,
      required: true
    },
    duration: Number, // For video/audio
    size: Number,
    format: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  access: {
    type: String,
    enum: ['public', 'registered', 'premium'],
    default: 'public'
  },
  metadata: {
    downloads: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    }
  }
}, {
  timestamps: true
});

// Pre-save hooks
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

tagSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

articleSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

resourceSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

// Methods
articleSchema.methods.updateMetadata = async function() {
  // Calculate read time based on content length
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  this.metadata.readTime = Math.ceil(wordCount / wordsPerMinute);

  await this.save();
};

articleSchema.methods.incrementViews = async function() {
  this.metadata.views += 1;
  await this.save();
};

articleSchema.methods.like = async function(userId) {
  const liked = await Article.findOne({
    _id: this._id,
    'likes.user': userId
  });

  if (!liked) {
    this.metadata.likes += 1;
    await this.save();
  }
};

resourceSchema.methods.incrementDownloads = async function() {
  this.metadata.downloads += 1;
  await this.save();
};

resourceSchema.methods.addRating = async function(rating) {
  const currentTotal = this.metadata.rating.average * this.metadata.rating.count;
  this.metadata.rating.count += 1;
  this.metadata.rating.average = (currentTotal + rating) / this.metadata.rating.count;
  await this.save();
};

// Indexes
categorySchema.index({ parent: 1 });
categorySchema.index({ order: 1 });

tagSchema.index({ count: -1 });

articleSchema.index({ author: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ 'metadata.views': -1 });
articleSchema.index({ 'metadata.likes': -1 });

resourceSchema.index({ type: 1 });
resourceSchema.index({ category: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ access: 1 });
articleSchema.index({ 'metadata.downloads': -1 });

const Category = mongoose.model('Category', categorySchema);
const Tag = mongoose.model('Tag', tagSchema);
const Article = mongoose.model('Article', articleSchema);
const Resource = mongoose.model('Resource', resourceSchema);

export { Category, Tag, Article, Resource };
