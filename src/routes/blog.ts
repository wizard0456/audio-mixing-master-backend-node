import { Router } from 'express';
import multer from 'multer';
import { BlogController } from '../controllers/BlogController';
import { auth } from '../middleware/auth';

const router = Router();

// Configure multer for FormData
const upload = multer();

// Public routes
router.get('/blogs', BlogController.index);
router.get('/blogs/categories', BlogController.getCategories);
router.get('/blogs/stats', BlogController.getStats);
router.get('/blogs/:id', BlogController.show);

// Add singular routes for frontend compatibility
router.get('/blog/categories', BlogController.getCategories);
router.get('/blog/stats', BlogController.getStats);
router.get('/blog/:id', BlogController.show);

// Protected routes (admin only)
router.post('/blogs', auth, upload.none(), BlogController.create);
router.put('/blogs/:id', auth, BlogController.update);
router.delete('/blogs/:id', auth, BlogController.destroy);
router.post('/blogs/:blog_id/upload-html', auth, BlogController.uploadHtml);

export default router; 