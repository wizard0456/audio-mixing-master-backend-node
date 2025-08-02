// Audio images data - same as frontend
const audioImages = [
  {
    id: 7086730,
    url: "https://images.pexels.com/photos/7086730/pexels-photo-7086730.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    photographer: "cottonbro studio",
    alt: "Musicians in a recording studio working together on a track."
  },
  {
    id: 2607311,
    url: "https://images.pexels.com/photos/2607311/pexels-photo-2607311.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    photographer: "Blaz Erzetic",
    alt: "Close-up of a headphone amplifier in a studio setting, showcasing sleek design and advanced technology."
  },
  {
    id: 7123348,
    url: "https://images.pexels.com/photos/7123348/pexels-photo-7123348.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    photographer: "Vollume",
    alt: "Music producer with headphones creating tracks on a laptop in a bright, indoor setting."
  },
  {
    id: 11317799,
    url: "https://images.pexels.com/photos/11317799/pexels-photo-11317799.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    photographer: "Orbital 101 Studio",
    alt: "Close-up of an audio interface with vibrant neon lighting in a music studio."
  },
  {
    id: 8198124,
    url: "https://images.pexels.com/photos/8198124/pexels-photo-8198124.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    photographer: "RDNE Stock project",
    alt: "Music producer in a recording studio adjusting sound mixer and smiling at the control panel."
  },
  {
    id: 3784221,
    url: "https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    photographer: "Dmitry Demidov",
    alt: "A detailed view of an audio mixer with glowing knobs, perfect for music production themes."
  },
  {
    id: 332688,
    url: "https://images.pexels.com/photos/332688/pexels-photo-332688.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    photographer: "Isabella Mendes",
    alt: "Close-up of a DJ mixing music at a club with vibrant atmosphere and crowd."
  },
  {
    id: 1238976,
    url: "https://images.pexels.com/photos/1238976/pexels-photo-1238976.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    photographer: "Aleksandr Neplokhov",
    alt: "Man with beard and bun spinning vinyl on a turntable indoors in a cozy urban setting."
  },
  {
    id: 1493004,
    url: "https://images.pexels.com/photos/1493004/pexels-photo-1493004.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    photographer: "Marlene Leppänen",
    alt: "A DJ uses a mixing panel and laptop indoors, blending music tracks seamlessly."
  },
  {
    id: 2123606,
    url: "https://images.pexels.com/photos/2123606/pexels-photo-2123606.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    photographer: "Gaby Tenda",
    alt: "DJ mixes music at a vibrant nightclub with disco lights and an enthusiastic crowd."
  }
];

/**
 * Get a random image URL based on totalCount % index pattern
 * This ensures consistent image assignment for the same blog
 * @param blogId - The blog ID to use for deterministic selection
 * @param isLarge - Whether to return a larger image size
 * @returns A random image URL
 */
export const getRandomImageForBlog = (blogId: number, isLarge: boolean = false): string => {
  const totalImages = audioImages.length;
  if (totalImages === 0) {
    // Return a default image if no images are available
    return 'https://images.pexels.com/photos/7086730/pexels-photo-7086730.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=250&w=400';
  }
  
  // Handle negative numbers by taking absolute value
  const positiveBlogId = Math.abs(blogId);
  const imageIndex = positiveBlogId % totalImages;
  const selectedImage = audioImages[imageIndex]!; // We know this exists since totalImages > 0
  
  if (isLarge) {
    // For single blog posts - larger size
    return selectedImage.url.replace('&h=650&w=940', '&h=400&w=800');
  } else {
    // For blog list - smaller size
    return selectedImage.url.replace('&h=650&w=940', '&h=250&w=400');
  }
};

/**
 * Check if a blog needs a fallback image and assign one
 * @param blog - The blog object
 * @param isLarge - Whether to use larger image size (for individual blog view)
 * @returns The blog with updated featured_image if needed
 */
export const assignFallbackImageIfNeeded = async (blog: any, isLarge: boolean = false): Promise<any> => {
  // If blog has no featured image or it's empty/null
  if (!blog.featured_image || blog.featured_image.trim() === '') {
    const fallbackImage = getRandomImageForBlog(blog.id, isLarge);
    
    // Store the external URL as-is since it's already a full web URL
    const publicImageUrl = fallbackImage;
    
    // Update the blog in the database with the fallback image
    try {
      await blog.update({ featured_image: publicImageUrl });
      console.log(`Assigned fallback image to blog ${blog.id}: ${publicImageUrl}`);
    } catch (error) {
      console.error(`Failed to update blog ${blog.id} with fallback image:`, error);
    }
    
    // Return the updated blog object
    return {
      ...blog.toJSON(),
      featured_image: publicImageUrl
    };
  }
  
  return blog;
};

/**
 * Convert a stored image path to a full web URL
 * @param imagePath - The stored image path (e.g., "public/blog_images/...")
 * @param req - Express request object to get protocol and host
 * @returns Full web URL
 */
export const convertToWebUrl = (imagePath: string, req: any): string => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Handle malformed URLs that have public/ prefix followed by external URLs
  if (imagePath.includes('public/') && imagePath.includes('http')) {
    // Extract the external URL part
    const httpIndex = imagePath.indexOf('http');
    if (httpIndex !== -1) {
      return imagePath.substring(httpIndex);
    }
  }
  
  // If it starts with "public/", remove the prefix and convert to web URL
  if (imagePath.startsWith('public/')) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    // Remove 'public/' prefix since public directory is the web root
    const webPath = imagePath.replace('public/', '');
    return `${baseUrl}/${webPath}`;
  }
  
  // If it's a relative path, assume it's in public folder
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${imagePath}`;
}; 