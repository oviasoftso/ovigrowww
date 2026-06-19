import { chatCompletion, streamChatCompletion, type ChatMessage } from './openrouter'

export interface PestAnalysisResult {
  pestName: string | null
  scientificName: string | null
  severity: 'low' | 'medium' | 'high' | 'critical' | null
  confidence: number
  description: string
  treatment: string
  prevention: string
  affectedCrops: string
}

export async function analyzePlantImage(imageBase64: string): Promise<PestAnalysisResult | null> {
  try {
    // Using a vision-capable model for image analysis
    // For OpenRouter vision, we need to format the content properly
    const response = await chatCompletion({
      model: 'anthropic/claude-sonnet-4', // Claude 4 supports vision
      messages: [
        {
          role: 'system',
          content: `You are an expert agricultural AI specializing in pest and disease identification for Zimbabwean farms.
          Analyze the provided image of a plant and identify any pests, diseases, or issues present.

          If you detect a pest or disease:
          1. Identify the pest/disease name and scientific name
          2. Assess severity (low, medium, high, critical)
          3. Provide a brief description of what you see
          4. Recommend treatment options suitable for Zimbabwean farmers
          5. Suggest prevention methods
          6. List affected crops

          If no issues are detected, indicate that the plant appears healthy.

          Format your response as JSON with the following structure:
          {
            "pestName": "string or null if healthy",
            "scientificName": "string or null if healthy",
            "severity": "low" | "medium" | "high" | "critical" | null,
            "confidence": number between 0 and 1,
            "description": "string",
            "treatment": "string",
            "prevention": "string",
            "affectedCrops": "string"
          }

          If healthy, set pestName, scientificName, and severity to null, and provide appropriate healthy plant messages.`
        },
        {
          role: 'user',
          content: `Please analyze this plant image for pests, diseases, or agricultural issues.

          Image data: data:image/jpeg;base64,${imageBase64}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })

    // Parse the JSON response
    const content = response.choices[0].message.content

    // Try to extract JSON from the response
    let jsonStr = content
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0].trim()
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0].trim()
    }

    const result = JSON.parse(jsonStr) as PestAnalysisResult

    // Validate result
    if (!result.pestName && !result.scientificName) {
      // Healthy plant case
      return {
        pestName: null,
        scientificName: null,
        severity: null,
        confidence: result.confidence || 0.9,
        description: result.description || 'Plant appears healthy with no visible pests or diseases.',
        treatment: 'No treatment needed. Continue regular monitoring and good agricultural practices.',
        prevention: 'Maintain field hygiene, use proper spacing, and monitor regularly for early detection.',
        affectedCrops: 'All crops appear healthy'
      }
    }

    return result
  } catch (error) {
    console.error('Error analyzing plant image:', error)
    return null
  }
}

// Fallback to simulation if AI service is not available
export async function simulatePlantAnalysis(): Promise<PestAnalysisResult> {
  // Return a random pest for simulation purposes
  const commonPests = [
    {
      pestName: 'Fall Armyworm',
      scientificName: 'Spodoptera frugiperda',
      severity: 'critical' as const,
      confidence: 0.92,
      description: 'Larvae feeding on leaves, creating characteristic windowpane damage. Found in whorl of maize plant.',
      treatment: 'Apply Bacillus thuringiensis or emamectin benzoate. Use push-pull technology with Napier grass and Desmodium.',
      prevention: 'Early planting, use of resistant varieties (SC 403, SC 529), biological control with Trichogramma wasps.',
      affectedCrops: 'Maize, Sorghum, Millet'
    },
    {
      pestName: 'Aphids',
      scientificName: 'Aphis spp.',
      severity: 'medium' as const,
      confidence: 0.87,
      description: 'Small green or black insects clustered on undersides of leaves and stems, excreting honeydew.',
      treatment: 'Introduce ladybugs, apply neem oil spray (5ml/L), or use reflective mulch to disorient them.',
      prevention: 'Encourage natural predators, maintain field hygiene, avoid excessive nitrogen fertilization.',
      affectedCrops: 'Beans, Groundnuts, Vegetables'
    },
    {
      pestName: 'Healthy Plant',
      scientificName: null as string | null,
      severity: null,
      confidence: 0.95,
      description: 'Plant appears healthy with no visible pests, diseases, or nutrient deficiencies.',
      treatment: 'No treatment needed. Continue regular monitoring and good agricultural practices.',
      prevention: 'Maintain field hygiene, use proper spacing, and monitor regularly for early detection.',
      affectedCrops: 'All crops appear healthy'
    }
  ]

  // Return random selection (biased toward healthy for demo)
  const rand = Math.random()
  if (rand < 0.4) {
    return commonPests[2] // Healthy plant
  } else if (rand < 0.7) {
    return commonPests[1] // Aphids
  } else {
    return commonPests[0] // Fall Armyworm
  }
}