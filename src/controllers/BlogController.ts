import { Request, Response } from 'express';
import { Blog, BlogCategory } from '../models';
import { Op } from 'sequelize';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { assignFallbackImageIfNeeded, convertToWebUrl } from '../utils/imageUtils';

// Configure multer for HTML file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = 'uploads/blog-html';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/html' || file.originalname.endsWith('.html')) {
      cb(null, true);
    } else {
      cb(new Error('Only HTML files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export class BlogController {
  // Get all blogs with pagination and search
  static async index(req: Request, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const perPage = parseInt(req.query['per_page'] as string) || 10;
      const search = req.query['search'] as string;
      const categoryId = req.query['category_id'] as string;
      const offset = (page - 1) * perPage;

      // Build where conditions
      const whereConditions: any = {
        is_published: 1
      };

      // Add search functionality
      if (search && search.trim()) {
        whereConditions[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { author_name: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } }
        ];
      }

      // Add category filter
      if (categoryId) {
        whereConditions.category_id = parseInt(categoryId);
      }

      const { count, rows: blogs } = await Blog.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: BlogCategory,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          }
        ],
        order: [['publish_date', 'DESC']],
        limit: perPage,
        offset: offset,
      });

      // Process blogs to assign fallback images if needed and convert to web URLs
      const processedBlogs = await Promise.all(
        blogs.map(async (blog) => {
          const processedBlog = await assignFallbackImageIfNeeded(blog);
          // Convert stored image path to web URL for frontend
          if (processedBlog.featured_image) {
            processedBlog.featured_image = convertToWebUrl(processedBlog.featured_image, req);
          }
          return processedBlog;
        })
      );

      const totalPages = Math.ceil(count / perPage);

      return res.json({
        success: true,
        data: {
          blogs: processedBlogs,
          pagination: {
            current_page: page,
            per_page: perPage,
            total: count,
            total_pages: totalPages,
            has_next_page: page < totalPages,
            has_prev_page: page > 1,
          },
        },
      });
    } catch (error) {
      console.error('Blog index error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get blog by ID or slug
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log(id);
      // const isSlug = isNaN(parseInt(id || '0'));

      let whereCondition: any;
      // if (isSlug) {
      //   whereCondition = { slug: id };
      // } else {
      //   whereCondition = { id: parseInt(id || '0') };
      // }
      whereCondition = { slug: id};
      console.log(whereCondition);
      const blog = await Blog.findOne({
        where: whereCondition,
        include: [
          {
            model: BlogCategory,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          }
        ],
      });

      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      // Assign fallback image if needed (for larger size since this is individual blog view)
      const processedBlog = await assignFallbackImageIfNeeded(blog, true);

      // Convert stored image path to web URL for frontend
      if (processedBlog.featured_image) {
        processedBlog.featured_image = convertToWebUrl(processedBlog.featured_image, req);
      }

      // Increment views
      blog.views += 1;
      await blog.save();

      return res.json({ success: true, data: { blog: processedBlog } });
    } catch (error) {
      console.error('Blog show error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Create new blog
  static async create(req: Request, res: Response) {
    try {
      const {
        title,
        author_name,
        publish_date,
        read_time,
        content,
        keywords,
        html_content,
        category_id,
        is_active
      } = req.body;

      // Generate slug from title
      const slug = (title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if slug already exists
      const existingBlog = await Blog.findOne({ where: { slug } });
      if (existingBlog) {
        return res.status(400).json({ message: 'A blog with this title already exists' });
      }

      const blog = await Blog.create({
        title: title || '',
        slug,
        author_name: author_name || '',
        publish_date: new Date(publish_date),
        read_time: parseInt(read_time || '5'),
        content: content || '',
        html_content: html_content || content || '',
        keywords: keywords || '',
        meta_description: '', // Not provided in frontend
        category_id: parseInt(category_id || '1'),
        is_published: (is_active === '1' || is_active === 1 || is_active === true) ? 1 : 0,
      });

      return res.status(201).json({ success: true, data: { blog } });
    } catch (error) {
      console.error('Blog create error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Update blog
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        title,
        author_name,
        publish_date,
        read_time,
        content,
        keywords,
        meta_description,
        category_id,
        is_published
      } = req.body;

      const blog = await Blog.findByPk(id);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      // Generate new slug if title changed
      let slug = blog.slug;
      if (title && title !== blog.title) {
        slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Check if new slug already exists
        const existingBlog = await Blog.findOne({ where: { slug, id: { [Op.ne]: id } } });
        if (existingBlog) {
          return res.status(400).json({ message: 'A blog with this title already exists' });
        }
      }

      await blog.update({
        title: title || blog.title,
        slug,
        author_name: author_name || blog.author_name,
        publish_date: publish_date ? new Date(publish_date) : blog.publish_date,
        read_time: read_time ? parseInt(read_time) : blog.read_time,
        content: content || blog.content,
        html_content: content || blog.html_content,
        keywords: keywords !== undefined ? keywords : blog.keywords,
        meta_description: meta_description !== undefined ? meta_description : blog.meta_description,
        category_id: category_id ? parseInt(category_id) : blog.category_id,
        is_published: is_published !== undefined ? ((is_published === 'true' || is_published === true) ? 1 : 0) : blog.is_published
      });

      return res.json({ success: true, data: { blog } });
    } catch (error) {
      console.error('Blog update error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Delete blog
  static async destroy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const blog = await Blog.findByPk(id);
      
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      await blog.destroy();
      return res.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
      console.error('Blog delete error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

//   Upload HTML file for blog
  static uploadHtml(req: Request, res: Response) {
    upload.single('html_file')(req, res, async (err) => {
      try {
        if (err) {
          return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ message: 'No HTML file uploaded' });
        }

        const { blog_id } = req.params;
        const blog = await Blog.findByPk(blog_id);
        
        if (!blog) {
          return res.status(404).json({ message: 'Blog not found' });
        }

        // Read the uploaded HTML file
        const htmlContent = fs.readFileSync(req.file.path, 'utf8');
        
        // Update blog with HTML content
        await blog.update({
          html_content: htmlContent
        });

        // Delete the uploaded file after reading
        fs.unlinkSync(req.file.path);

        return res.json({ 
          success: true, 
          message: 'HTML content uploaded successfully',
          data: { blog }
        });
      } catch (error) {
        console.error('Blog upload HTML error:', error);
        return res.status(500).json({ message: 'Server error' });
      }
    });
  }

  // Get blog categories
  static async getCategories(_req: Request, res: Response) {
    try {
      const categories = await BlogCategory.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']]
      });

      return res.json({ success: true, data: { categories } });
    } catch (error) {
      console.error('Blog categories error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get blog statistics
  static async getStats(_req: Request, res: Response) {
    try {
      const totalBlogs = await Blog.count();
      const publishedBlogs = await Blog.count({ where: { is_published: 1 } });
      const totalViews = await Blog.sum('views') || 0;
      const totalCategories = await BlogCategory.count({ where: { is_active: true } });

      const stats = {
        totalBlogs,
        publishedBlogs,
        totalViews,
        totalCategories
      };

      return res.json({ success: true, data: { stats } });
    } catch (error) {
      console.error('Blog stats error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
} 