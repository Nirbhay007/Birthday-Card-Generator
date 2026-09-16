export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday.nirbhay.online';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      // Allow all known AI/LLM crawlers to access content and llms.txt
      {
        userAgent: [
          // OpenAI
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          // Google
          'Google-Extended',
          'Googlebot',
          // Anthropic / Claude
          'ClaudeBot',
          'Anthropic-ai',
          'Claude-Web',
          // Perplexity
          'PerplexityBot',
          // Meta
          'Meta-ExternalAgent',
          'Meta-ExternalFetcher',
          // Apple
          'Applebot',
          'Applebot-Extended',
          // ByteDance / TikTok
          'Bytespider',
          // Cohere
          'cohere-ai',
          // Amazon
          'Amazonbot',
          // You.com
          'YouBot',
          // Diffbot
          'Diffbot',
          // Common Crawl (training datasets)
          'CCBot',
          // DataForSEO
          'DataForSeoBot',
          // Timpi
          'Timpibot',
          // Brave Search
          'Brave-Search',
          // Mistral / Le Chat
          'MistralAI-User',
        ],
        allow: ['/', '/llms.txt', '/llms-full.txt', '/wishes', '/ages', '/premium'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
