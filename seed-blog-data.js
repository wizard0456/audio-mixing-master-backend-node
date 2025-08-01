const { BlogCategory, Blog } = require('./src/models');
const { sequelize } = require('./src/config/database');

// Sample blog categories
const blogCategories = [
    {
        name: 'Audio Mixing',
        slug: 'audio-mixing',
        description: 'Articles about audio mixing techniques and best practices',
        is_active: 1
    },
    {
        name: 'Music Production',
        slug: 'music-production',
        description: 'Music production tips, tutorials, and industry insights',
        is_active: 1
    },
    {
        name: 'Studio Equipment',
        slug: 'studio-equipment',
        description: 'Reviews and guides for studio equipment and gear',
        is_active: 1
    },
    {
        name: 'Mastering',
        slug: 'mastering',
        description: 'Audio mastering techniques and professional tips',
        is_active: 1
    },
    {
        name: 'Industry Tips',
        slug: 'industry-tips',
        description: 'Professional advice and industry insights',
        is_active: 1
    }
];

// Sample blog posts with featured images
const blogPosts = [
    {
        title: 'The History of Mixing and Mastering',
        slug: 'the-history-of-mixing-and-mastering',
        author_name: 'Audio Expert',
        publish_date: '2024-01-15',
        read_time: 8,
        content: 'Audio mixing and mastering have evolved significantly over the decades. From the early days of analog recording to today\'s digital revolution, the art of creating professional-quality audio has undergone remarkable transformations. This comprehensive guide explores the history, techniques, and modern approaches to mixing and mastering.',
        html_content: `
            <h2>The Early Days of Audio Recording</h2>
            <p>Audio mixing and mastering have evolved significantly over the decades. From the early days of analog recording to today's digital revolution, the art of creating professional-quality audio has undergone remarkable transformations.</p>
            
            <h2>The Analog Era</h2>
            <p>In the 1950s and 1960s, recording studios relied on large format analog consoles and tape machines. Engineers developed techniques for balancing multiple tracks, applying EQ, compression, and reverb to create the final mix.</p>
            
            <h2>The Digital Revolution</h2>
            <p>The introduction of digital audio workstations (DAWs) in the 1980s and 1990s revolutionized the industry. Suddenly, engineers could work with unlimited tracks, precise editing capabilities, and powerful plugins.</p>
            
            <h2>Modern Techniques</h2>
            <p>Today's mixing and mastering engineers combine traditional analog techniques with cutting-edge digital tools. The goal remains the same: creating music that sounds great on any playback system.</p>
        `,
        keywords: 'audio mixing, mastering, history, analog, digital, recording',
        category_id: 1,
        is_published: 1,
        featured_image: 'https://images.pexels.com/photos/7086730/pexels-photo-7086730.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        views: 0
    },
    {
        title: 'Tips On Recording Vocals',
        slug: 'tips-on-recording-vocals',
        author_name: 'Studio Pro',
        publish_date: '2024-01-20',
        read_time: 10,
        content: 'Recording vocals is one of the most critical aspects of music production. The human voice is incredibly dynamic and requires careful attention to detail. This guide covers essential techniques for capturing professional-quality vocal recordings.',
        html_content: `
            <h2>Choosing the Right Microphone</h2>
            <p>The microphone you choose can make or break your vocal recording. Large diaphragm condensers are popular for their warm, detailed sound, while dynamic microphones excel at handling high SPL levels.</p>
            
            <h2>Room Acoustics</h2>
            <p>Your recording environment plays a crucial role in vocal quality. Consider using acoustic treatment to minimize unwanted reflections and create a controlled recording space.</p>
            
            <h2>Microphone Technique</h2>
            <p>Proper microphone positioning is essential. Generally, position the mic 6-12 inches from the singer's mouth, slightly above or below to avoid plosives. Encourage the singer to maintain consistent distance.</p>
            
            <h2>Monitoring and Headphones</h2>
            <p>Good headphones are essential for vocal recording. Closed-back headphones help prevent bleed and allow the singer to hear themselves clearly while recording.</p>
        `,
        keywords: 'vocal recording, microphone, acoustics, studio, technique',
        category_id: 2,
        is_published: 1,
        featured_image: 'https://images.pexels.com/photos/2607311/pexels-photo-2607311.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        views: 0
    },
    {
        title: 'Understanding Compression in Audio',
        slug: 'understanding-compression-in-audio',
        author_name: 'Mix Engineer',
        publish_date: '2024-01-25',
        read_time: 12,
        content: 'Compression is one of the most powerful tools in audio production, yet it\'s often misunderstood. This comprehensive guide explains how compression works, when to use it, and how to achieve professional results.',
        html_content: `
            <h2>What is Compression?</h2>
            <p>Compression reduces the dynamic range of an audio signal by attenuating loud sounds while leaving quiet sounds unchanged. This creates a more consistent and controlled sound.</p>
            
            <h2>Key Parameters</h2>
            <p>Understanding threshold, ratio, attack, and release is crucial for effective compression. Each parameter affects how the compressor responds to the input signal.</p>
            
            <h2>Types of Compression</h2>
            <p>Different types of compressors (VCA, FET, Optical, Tube) have unique characteristics. Learning when to use each type can significantly improve your mixes.</p>
            
            <h2>Common Applications</h2>
            <p>Compression is used on vocals, drums, bass, and many other instruments. Each application requires different settings and approaches.</p>
        `,
        keywords: 'compression, audio, dynamics, mixing, studio',
        category_id: 1,
        is_published: 1,
        featured_image: 'https://images.pexels.com/photos/7123348/pexels-photo-7123348.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        views: 0
    },
    {
        title: 'Essential Studio Equipment for Beginners',
        slug: 'essential-studio-equipment-for-beginners',
        author_name: 'Gear Expert',
        publish_date: '2024-01-30',
        read_time: 15,
        content: 'Building a home studio can be overwhelming with so many options available. This guide helps beginners understand what equipment they need to get started and how to make smart purchasing decisions.',
        html_content: `
            <h2>Computer and DAW</h2>
            <p>Your computer is the heart of your studio. Choose a machine with sufficient processing power and RAM. Popular DAWs include Pro Tools, Logic Pro, Ableton Live, and Reaper.</p>
            
            <h2>Audio Interface</h2>
            <p>An audio interface connects your computer to microphones and instruments. Look for interfaces with good preamps and low latency drivers.</p>
            
            <h2>Microphones</h2>
            <p>Start with a versatile large diaphragm condenser microphone. Popular options include the Shure SM7B, Audio-Technica AT2020, and Rode NT1.</p>
            
            <h2>Monitors and Headphones</h2>
            <p>Studio monitors and headphones are essential for accurate mixing. Invest in quality monitoring equipment to make better mixing decisions.</p>
        `,
        keywords: 'studio equipment, home studio, audio interface, microphones, monitors',
        category_id: 3,
        is_published: 1,
        featured_image: 'https://images.pexels.com/photos/11317799/pexels-photo-11317799.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        views: 0
    },
    {
        title: 'The Art of EQ in Mixing',
        slug: 'the-art-of-eq-in-mixing',
        author_name: 'Audio Engineer',
        publish_date: '2024-02-05',
        read_time: 14,
        content: 'Equalization is fundamental to mixing. Understanding how to use EQ effectively can transform your mixes from amateur to professional. This guide covers EQ techniques, frequency ranges, and common applications.',
        html_content: `
            <h2>Understanding Frequency Ranges</h2>
            <p>Different frequency ranges affect how we perceive sound. Low frequencies provide warmth and power, mid frequencies carry most musical information, and high frequencies add clarity and air.</p>
            
            <h2>Types of EQ</h2>
            <p>Graphic EQs, parametric EQs, and shelving EQs each have specific uses. Understanding when to use each type is crucial for effective mixing.</p>
            
            <h2>Common EQ Techniques</h2>
            <p>High-pass filtering, notch filtering, and gentle boosts are common EQ techniques. Learning when and how to apply these techniques can significantly improve your mixes.</p>
            
            <h2>EQ for Different Instruments</h2>
            <p>Each instrument has unique frequency characteristics. Understanding these helps you make better EQ decisions during mixing.</p>
        `,
        keywords: 'EQ, equalization, mixing, frequency, audio',
        category_id: 1,
        is_published: 1,
        featured_image: 'https://images.pexels.com/photos/8198124/pexels-photo-8198124.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        views: 0
    },
    {
        title: 'Mastering Your Music: A Complete Guide',
        slug: 'mastering-your-music-a-complete-guide',
        author_name: 'Mastering Engineer',
        publish_date: '2024-02-10',
        read_time: 18,
        content: 'Mastering is the final step in music production, preparing your mix for distribution. This comprehensive guide covers mastering techniques, tools, and best practices for achieving professional results.',
        html_content: `
            <h2>What is Mastering?</h2>
            <p>Mastering prepares your mix for distribution by ensuring it sounds great on all playback systems. It involves final EQ adjustments, compression, limiting, and creating consistent levels.</p>
            
            <h2>Mastering Tools</h2>
            <p>Essential mastering tools include multiband compressors, limiters, and precise EQ. Understanding how to use these tools effectively is crucial for professional results.</p>
            
            <h2>Loudness Standards</h2>
            <p>Different platforms have different loudness requirements. Understanding LUFS and loudness standards helps you create masters that sound great everywhere.</p>
            
            <h2>Mastering Workflow</h2>
            <p>A systematic approach to mastering ensures consistent results. This includes proper gain staging, careful listening, and reference comparisons.</p>
        `,
        keywords: 'mastering, audio, loudness, compression, limiting',
        category_id: 4,
        is_published: 1,
        featured_image: 'https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        views: 0
    },
    {
        title: 'Building a Professional Home Studio',
        slug: 'building-a-professional-home-studio',
        author_name: 'Studio Designer',
        publish_date: '2024-02-15',
        read_time: 20,
        content: 'Creating a professional home studio requires careful planning and investment. This guide covers room design, acoustic treatment, equipment selection, and workflow optimization.',
        html_content: `
            <h2>Room Selection and Design</h2>
            <p>Choose a room with good dimensions and minimal external noise. Consider room modes and how they affect your monitoring environment.</p>
            
            <h2>Acoustic Treatment</h2>
            <p>Proper acoustic treatment is essential for accurate monitoring. This includes bass traps, absorption panels, and diffusion elements.</p>
            
            <h2>Equipment Selection</h2>
            <p>Invest in quality equipment that matches your needs and budget. Focus on the most critical components first: monitors, interface, and microphones.</p>
            
            <h2>Workflow Optimization</h2>
            <p>Design your studio layout for efficient workflow. Consider ergonomics, cable management, and accessibility of frequently used equipment.</p>
        `,
        keywords: 'home studio, acoustic treatment, studio design, equipment',
        category_id: 3,
        is_published: 1,
        featured_image: 'https://images.pexels.com/photos/332688/pexels-photo-332688.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        views: 0
    },
    {
        title: 'Understanding Reverb and Delay',
        slug: 'understanding-reverb-and-delay',
        author_name: 'Effects Specialist',
        publish_date: '2024-02-20',
        read_time: 16,
        content: 'Reverb and delay are essential effects that add space and depth to your mixes. Understanding how to use these effects effectively can transform your productions.',
        html_content: `
            <h2>Types of Reverb</h2>
            <p>Different types of reverb (room, hall, plate, spring) create different spatial characteristics. Understanding these differences helps you choose the right reverb for each application.</p>
            
            <h2>Reverb Parameters</h2>
            <p>Key reverb parameters include decay time, pre-delay, room size, and damping. Learning how these affect the sound helps you create more realistic spaces.</p>
            
            <h2>Delay Effects</h2>
            <p>Delay can create echo effects, thickening, and rhythmic interest. Understanding delay time, feedback, and modulation opens up creative possibilities.</p>
            
            <h2>Practical Applications</h2>
            <p>Reverb and delay are used on vocals, drums, guitars, and many other instruments. Learning when and how to apply these effects improves your mixes.</p>
        `,
        keywords: 'reverb, delay, effects, mixing, spatial',
        category_id: 1,
        is_published: 1,
        featured_image: 'https://images.pexels.com/photos/1238976/pexels-photo-1238976.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        views: 0
    },
    {
        title: 'The Business of Audio Engineering',
        slug: 'the-business-of-audio-engineering',
        author_name: 'Industry Pro',
        publish_date: '2024-02-25',
        read_time: 12,
        content: 'Success in audio engineering requires more than technical skills. This guide covers business aspects, networking, pricing, and building a sustainable career in the audio industry.',
        html_content: `
            <h2>Building Your Brand</h2>
            <p>Develop a strong personal brand that reflects your skills and values. This includes your online presence, portfolio, and professional reputation.</p>
            
            <h2>Networking and Relationships</h2>
            <p>Building relationships with other professionals is crucial for success. Attend industry events, join online communities, and collaborate with other musicians and engineers.</p>
            
            <h2>Pricing Your Services</h2>
            <p>Understanding how to price your services competitively while maintaining profitability is essential. Consider your costs, market rates, and value proposition.</p>
            
            <h2>Marketing and Promotion</h2>
            <p>Effective marketing helps you attract clients and build your reputation. Use social media, portfolio websites, and word-of-mouth referrals.</p>
        `,
        keywords: 'business, audio engineering, networking, pricing, marketing',
        category_id: 5,
        is_published: 1,
        featured_image: 'https://images.pexels.com/photos/1493004/pexels-photo-1493004.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        views: 0
    },
    {
        title: 'Mixdown preparation',
        slug: 'mixdown-preparation',
        author_name: 'Mix Engineer',
        publish_date: '2024-03-01',
        read_time: 10,
        content: 'Proper mixdown preparation is crucial for achieving professional results. This guide covers organization, gain staging, and preparation techniques that set you up for mixing success.',
        html_content: `
            <h2>Session Organization</h2>
            <p>Organize your session with clear track names, colors, and grouping. This makes mixing more efficient and reduces confusion during the process.</p>
            
            <h2>Gain Staging</h2>
            <p>Proper gain staging ensures optimal signal flow and prevents clipping. Set appropriate levels for each track before beginning the mix.</p>
            
            <h2>Track Preparation</h2>
            <p>Clean up tracks by removing unwanted noise, editing timing issues, and ensuring consistent levels. This creates a solid foundation for mixing.</p>
            
            <h2>Reference Tracks</h2>
            <p>Choose reference tracks that match your target sound. Use these throughout the mixing process to guide your decisions.</p>
        `,
        keywords: 'mixdown, preparation, gain staging, organization, mixing',
        category_id: 1,
        is_published: 1,
        featured_image: 'https://images.pexels.com/photos/2123606/pexels-photo-2123606.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        views: 0
    }
];

async function seedBlogCategories() {
    console.log('Seeding blog categories...');
    
    for (const category of blogCategories) {
        try {
            await BlogCategory.create(category);
            console.log(`Created category: ${category.name}`);
        } catch (error) {
            console.error(`Error creating category ${category.name}:`, error.message);
        }
    }
}

async function seedBlogPosts() {
    console.log('Seeding blog posts...');
    
    for (const post of blogPosts) {
        try {
            await Blog.create(post);
            console.log(`Created blog post: ${post.title}`);
        } catch (error) {
            console.error(`Error creating blog post ${post.title}:`, error.message);
        }
    }
}

async function seedBlogData() {
    try {
        console.log('Starting blog data seeding...');
        
        // Sync database
        await sequelize.sync();
        
        // First seed categories
        await seedBlogCategories();
        
        // Then seed blog posts
        await seedBlogPosts();
        
        console.log('Blog data seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding blog data:', error);
        process.exit(1);
    }
}

// Run the seeding
seedBlogData(); 