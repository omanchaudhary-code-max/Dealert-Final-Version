import { productRepository } from '@/repositories/product.repository'

/**
 * Minimum price history data points required before relying on all-time low for bounds.
 * Per the crawler's rule: minimum 7 data points before calling a price an all-time low.
 */
export const MIN_ENTRIES = 7

export interface ValidateTargetPriceInput {
  targetPrice?: number | null
  targetPriceMin?: number | null
  currentPrice: number
  allTimeLow: number
  historyCount: number
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Pure, testable function that validates target price and target price min against realistic bounds.
 * Rejects with a clear, specific error message the moment one rule fails.
 */
export function validateWishlistTargetPrice(input: ValidateTargetPriceInput): ValidationResult {
  const { targetPrice, targetPriceMin, currentPrice, allTimeLow, historyCount } = input

  // Rule 1: targetPrice must be strictly less than currentPrice (if provided)
  if (targetPrice !== undefined && targetPrice !== null) {
    if (targetPrice >= currentPrice) {
      return {
        valid: false,
        error: `Target price must be below the current price (Rs. ${currentPrice}).`,
      }
    }

    // Rule 2 & Rule 3 for targetPrice
    if (historyCount >= MIN_ENTRIES) {
      // Rule 2: targetPrice must be no more than 10% below allTimeLow
      const floorBound = Math.round(allTimeLow * 0.9)
      if (targetPrice < floorBound) {
        return {
          valid: false,
          error: `This product has never been priced below Rs. ${allTimeLow} — try a target closer to that (minimum realistic target: Rs. ${floorBound}).`,
        }
      }
    } else {
      // Rule 3: historyCount < MIN_ENTRIES -> targetPrice >= currentPrice * 0.5
      const fallbackFloor = Math.round(currentPrice * 0.5)
      if (targetPrice < fallbackFloor) {
        return {
          valid: false,
          error: `Not enough price history yet for this product to validate a target that far below the current price (Rs. ${currentPrice}). Try a target no lower than Rs. ${fallbackFloor}.`,
        }
      }
    }
  }

  // Rule 4: If targetPriceMin is provided (and non-null)
  if (targetPriceMin !== undefined && targetPriceMin !== null) {
    // 4a: targetPriceMin must be strictly less than targetPrice (if targetPrice is set)
    if (targetPrice !== undefined && targetPrice !== null) {
      if (targetPriceMin >= targetPrice) {
        return {
          valid: false,
          error: `Your minimum price must be lower than your target price.`,
        }
      }
    }

    // 4b: targetPriceMin must pass the SAME bound check as targetPrice from rules 2/3 above
    if (historyCount >= MIN_ENTRIES) {
      const floorBound = Math.round(allTimeLow * 0.9)
      if (targetPriceMin < floorBound) {
        return {
          valid: false,
          error: `This product has never been priced below Rs. ${allTimeLow} — try a target closer to that (minimum realistic target: Rs. ${floorBound}).`,
        }
      }
    } else {
      const fallbackFloor = Math.round(currentPrice * 0.5)
      if (targetPriceMin < fallbackFloor) {
        return {
          valid: false,
          error: `Not enough price history yet for this product to validate a target that far below the current price (Rs. ${currentPrice}). Try a target no lower than Rs. ${fallbackFloor}.`,
        }
      }
    }
  }

  return { valid: true }
}

export interface ProductValidationDetails extends ValidationResult {
  currentPrice?: number
  allTimeLow?: number
  historyCount?: number
  floorBound?: number
}

/**
 * Helper function to fetch product price history and execute validateWishlistTargetPrice.
 */
export async function validateWishlistTargetPriceForProduct(
  itemIdOrProductId: string,
  targetPrice?: number | null,
  targetPriceMin?: number | null
): Promise<ProductValidationDetails> {
  const product =
    (await productRepository.findByItemId(itemIdOrProductId)) ||
    (await productRepository.findById(itemIdOrProductId))

  if (!product) {
    return { valid: false, error: 'Product does not exist in the system catalog' }
  }

  const priceHistory = await productRepository.getPriceHistory(product.itemId || product.id)
  const historicalPrices = priceHistory.map((ph) => ph.price)
  const currentPrice = product.currentPrice
  const allTimeLow = historicalPrices.length > 0 ? Math.min(...historicalPrices) : currentPrice
  const historyCount = priceHistory.length

  const floorBound = historyCount >= MIN_ENTRIES ? Math.round(allTimeLow * 0.9) : Math.round(currentPrice * 0.5)

  const validation = validateWishlistTargetPrice({
    targetPrice,
    targetPriceMin,
    currentPrice,
    allTimeLow,
    historyCount,
  })

  return {
    ...validation,
    currentPrice,
    allTimeLow,
    historyCount,
    floorBound,
  }
}
