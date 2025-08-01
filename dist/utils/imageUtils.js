"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToWebUrl = exports.assignFallbackImageIfNeeded = exports.getRandomImageForBlog = void 0;
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
const getRandomImageForBlog = (blogId, isLarge = false) => {
    const totalImages = audioImages.length;
    if (totalImages === 0) {
        return 'https://images.pexels.com/photos/7086730/pexels-photo-7086730.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=250&w=400';
    }
    const positiveBlogId = Math.abs(blogId);
    const imageIndex = positiveBlogId % totalImages;
    const selectedImage = audioImages[imageIndex];
    if (isLarge) {
        return selectedImage.url.replace('&h=650&w=940', '&h=400&w=800');
    }
    else {
        return selectedImage.url.replace('&h=650&w=940', '&h=250&w=400');
    }
};
exports.getRandomImageForBlog = getRandomImageForBlog;
const assignFallbackImageIfNeeded = async (blog, isLarge = false) => {
    if (!blog.featured_image || blog.featured_image.trim() === '') {
        const fallbackImage = (0, exports.getRandomImageForBlog)(blog.id, isLarge);
        const publicImageUrl = `public/blog_images/${fallbackImage}`;
        try {
            await blog.update({ featured_image: publicImageUrl });
            console.log(`Assigned fallback image to blog ${blog.id}: ${publicImageUrl}`);
        }
        catch (error) {
            console.error(`Failed to update blog ${blog.id} with fallback image:`, error);
        }
        return {
            ...blog.toJSON(),
            featured_image: publicImageUrl
        };
    }
    return blog;
};
exports.assignFallbackImageIfNeeded = assignFallbackImageIfNeeded;
const convertToWebUrl = (imagePath, req) => {
    if (!imagePath)
        return '';
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    if (imagePath.startsWith('public/')) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        return `${baseUrl}/${imagePath}`;
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/${imagePath}`;
};
exports.convertToWebUrl = convertToWebUrl;
//# sourceMappingURL=imageUtils.js.map