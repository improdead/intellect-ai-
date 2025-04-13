import { Message } from "ai";

// Interface for research options
export interface ResearchOptions {
  preferredSources?: string[];
  excludedSources?: string[];
  searchQuery?: string;
}

// Interface for research response
export interface ResearchResponse {
  text: string;
  sources?: {
    title: string;
    url: string;
    snippet?: string;
  }[];
}

// Client for OpenAI GPT-4o-mini-search API
export const perplexityClient = {
  // Send a research query to the OpenAI API
  async sendResearchQuery(
    messages: Message[],
    options: ResearchOptions = {}
  ): Promise<ResearchResponse> {
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          preferredSources: options.preferredSources || [],
          excludedSources: options.excludedSources || [],
          searchQuery: options.searchQuery,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `API call failed with status: ${response.status}`
        );
      }

      // For streaming responses, this will be handled by the useChat hook
      // This method is for non-streaming use cases
      const data = await response.json();
      return {
        text: data.text || "",
        sources: data.sources || [],
      };
    } catch (error) {
      console.error("Error in sendResearchQuery:", error);
      throw error;
    }
  },

  // Extract sources from a response
  extractSources(
    text: string
  ): { title: string; url: string; snippet?: string }[] {
    // Enhanced regex to extract URLs and sources from text
    const sources: { title: string; url: string; snippet?: string }[] = [];

    // Look for source sections at the end of the text
    // Try different patterns that might indicate a sources section
    const sourcesPatterns = [
      // Numbered sources (most common with GPT-4o-mini-search)
      /(?:sources|references|citations)?:?\s*(?:\n\s*)?(?:1\.\s|\[1\]\s)([\s\S]+)$/i,
      // General sources section
      /(?:sources|references|citations):?\s*\n([\s\S]+)$/i,
      // Numbered references anywhere in the text
      /(?:\n|^)\s*(?:\d+\.\s|\[\d+\]\s)([^\n]+https?:\/\/[^\s)]+)/gm,
    ];

    let sourcesText = "";
    let numberedReferences: string[] = [];

    // Try to find a sources section first
    for (const pattern of sourcesPatterns.slice(0, 2)) {
      const match = text.match(pattern);
      if (match && match[1]) {
        sourcesText = match[1];
        break;
      }
    }

    // If no sources section found, try to find numbered references throughout the text
    if (!sourcesText) {
      const pattern = sourcesPatterns[2];
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1]) numberedReferences.push(match[1]);
      }

      if (numberedReferences.length > 0) {
        sourcesText = numberedReferences.join("\n");
      }
    }

    // If we found a sources section or numbered references, process them
    if (sourcesText) {
      // Split by numbered items or bullet points
      const sourceItems = sourcesText
        .split(/\n\s*(?:\d+\.\s*|-\s*|\*\s*|\[\d+\]\s*)/)
        .filter((item) => item.trim().length > 0);

      for (const item of sourceItems) {
        // Try to extract URL
        const urlMatch = item.match(/https?:\/\/[^\s)"]+/);
        if (urlMatch) {
          const url = urlMatch[0];

          // Try to extract title
          // First look for text that might be a title before the URL
          let title = "";
          const beforeUrl = item.split(url)[0].trim();

          if (
            beforeUrl &&
            !beforeUrl.endsWith(":") &&
            !beforeUrl.endsWith("(")
          ) {
            // If there's text before the URL that doesn't end with : or (, it might be a title
            title = beforeUrl;
          } else {
            // Otherwise try to extract from domain
            try {
              const domain = new URL(url).hostname.replace("www.", "");
              title = domain.charAt(0).toUpperCase() + domain.slice(1);
            } catch (e) {
              title = "Source";
            }
          }

          // Extract snippet (text after the URL)
          const afterUrl = item.split(url)[1]?.trim() || "";

          sources.push({
            title: title.replace(/[":,]$/, ""),
            url,
            snippet: afterUrl || undefined,
          });
        }
      }
    }

    // If no sources found yet, try to extract URLs from the entire text
    if (sources.length === 0) {
      const urlRegex = /(https?:\/\/[^\s)"]+)/g;
      let match;
      while ((match = urlRegex.exec(text)) !== null) {
        const url = match[1];
        // Extract surrounding text as context
        const start = Math.max(0, match.index - 50);
        const end = Math.min(text.length, match.index + url.length + 50);
        const context = text.substring(start, end);

        // Use domain as title
        let title;
        try {
          const domain = new URL(url).hostname.replace("www.", "");
          title = domain.charAt(0).toUpperCase() + domain.slice(1);
        } catch (e) {
          title = "Source";
        }

        // Check if this URL is already in sources
        if (!sources.some((s) => s.url === url)) {
          sources.push({
            title,
            url,
            snippet: context,
          });
        }
      }
    }

    return sources;
  },
};
