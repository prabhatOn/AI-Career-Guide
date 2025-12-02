// Simple PDF text extractor for Cloudflare Workers
// Uses pdf.js-based extraction

export default {
  async fetch(request, env, ctx) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const arrayBuffer = await file.arrayBuffer();
      const text = await extractTextFromPDF(arrayBuffer);

      return new Response(JSON.stringify({ text, filename: file.name }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('PDF parsing error:', error);
      return new Response(JSON.stringify({ error: 'Failed to parse PDF', details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

// Basic PDF text extraction
// This is a simplified extractor that works in Workers environment
async function extractTextFromPDF(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const text = [];
  
  // Convert to string for parsing
  let pdfString = '';
  for (let i = 0; i < bytes.length; i++) {
    pdfString += String.fromCharCode(bytes[i]);
  }

  // Extract text between BT (begin text) and ET (end text) markers
  const textBlocks = pdfString.match(/BT[\s\S]*?ET/g) || [];
  
  for (const block of textBlocks) {
    // Extract text from Tj and TJ operators
    const tjMatches = block.match(/\(([^)]*)\)\s*Tj/g) || [];
    const tjArrayMatches = block.match(/\[(.*?)\]\s*TJ/g) || [];
    
    for (const match of tjMatches) {
      const content = match.match(/\(([^)]*)\)/);
      if (content && content[1]) {
        text.push(decodeText(content[1]));
      }
    }
    
    for (const match of tjArrayMatches) {
      const arrayContent = match.match(/\[(.*?)\]/);
      if (arrayContent && arrayContent[1]) {
        const strings = arrayContent[1].match(/\(([^)]*)\)/g) || [];
        for (const str of strings) {
          const content = str.match(/\(([^)]*)\)/);
          if (content && content[1]) {
            text.push(decodeText(content[1]));
          }
        }
      }
    }
  }

  // Also try to find stream content
  const streams = pdfString.match(/stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g) || [];
  for (const stream of streams) {
    // Look for readable text in streams
    const readable = stream.match(/[A-Za-z0-9\s,.!?;:'"()-]{10,}/g) || [];
    text.push(...readable);
  }

  let result = text.join(' ')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If no text found, return helpful message
  if (!result || result.length < 50) {
    return "Could not extract text from this PDF. The PDF might be image-based or encrypted. Please copy and paste your resume text directly.";
  }

  return result;
}

function decodeText(str) {
  return str
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t');
}
