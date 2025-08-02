import { describe, it, expect } from '@jest/globals';
import { getRandomImageForBlog, convertToWebUrl } from '../../src/utils/imageUtils';

describe('Image Utils', () => {
  describe('getRandomImageForBlog', () => {
    it('should return a consistent image for the same blog ID', () => {
      const blogId = 1;
      const image1 = getRandomImageForBlog(blogId, false);
      const image2 = getRandomImageForBlog(blogId, false);
      
      expect(image1).toBe(image2);
    });

    it('should return different images for different blog IDs', () => {
      const image1 = getRandomImageForBlog(1, false);
      const image2 = getRandomImageForBlog(2, false);
      
      expect(image1).not.toBe(image2);
    });

    it('should return larger images when isLarge is true', () => {
      const smallImage = getRandomImageForBlog(1, false);
      const largeImage = getRandomImageForBlog(1, true);
      
      expect(smallImage).toContain('&h=250&w=400');
      expect(largeImage).toContain('&h=400&w=800');
    });

    it('should handle blog ID 0 correctly', () => {
      const image = getRandomImageForBlog(0, false);
      expect(image).toContain('pexels.com');
    });

    it('should handle negative blog IDs', () => {
      const image = getRandomImageForBlog(-1, false);
      expect(image).toContain('pexels.com');
    });
  });

  describe('convertToWebUrl', () => {
    const mockReq = {
      protocol: 'http',
      get: (_host: string) => 'localhost:3000'
    };

    it('should convert public path to web URL', () => {
      const imagePath = 'public/blog_images/image.jpg';
      const webUrl = convertToWebUrl(imagePath, mockReq);
      expect(webUrl).toBe('http://localhost:3000/blog_images/image.jpg');
    });

    it('should return full URL as is', () => {
      const imagePath = 'https://images.pexels.com/photos/123.jpg';
      const webUrl = convertToWebUrl(imagePath, mockReq);
      expect(webUrl).toBe('https://images.pexels.com/photos/123.jpg');
    });

    it('should handle relative paths', () => {
      const imagePath = 'blog-images/image.jpg';
      const webUrl = convertToWebUrl(imagePath, mockReq);
      expect(webUrl).toBe('http://localhost:3000/blog-images/image.jpg');
    });

    it('should handle malformed URLs with public/ prefix and external URLs', () => {
      const imagePath = 'public/blog_images/https://images.pexels.com/photos/123.jpg';
      const webUrl = convertToWebUrl(imagePath, mockReq);
      expect(webUrl).toBe('https://images.pexels.com/photos/123.jpg');
    });

    it('should handle empty paths', () => {
      const webUrl = convertToWebUrl('', mockReq);
      expect(webUrl).toBe('');
    });
  });
}); 