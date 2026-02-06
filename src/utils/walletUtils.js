// Wallet utility functions for score management
// This handles all wallet operations: initialization, purchase, deduction, transaction tracking

const WALLET_STORAGE_KEY = "userWallet";
const DEFAULT_USER_ID = "user_demo";

/**
 * Initialize or retrieve user wallet from localStorage
 * @returns {Object} wallet object with userId, balance, transactions
 */
export function initializeWallet() {
  const stored = localStorage.getItem(WALLET_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  const newWallet = {
    userId: DEFAULT_USER_ID,
    userName: "User",
    avatar: "default",
    balance: 0,
    transactions: [],
    createdAt: new Date().toISOString(),
  };
  
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(newWallet));
  return newWallet;
}

/**
 * Get current wallet from localStorage
 * @returns {Object} current wallet
 */
export function getWallet() {
  const stored = localStorage.getItem(WALLET_STORAGE_KEY);
  return stored ? JSON.parse(stored) : initializeWallet();
}

/**
 * Save wallet to localStorage
 * @param {Object} wallet - wallet object to save
 */
export function saveWallet(wallet) {
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
}

/**
 * Purchase score (add to balance)
 * @param {number} amount - score amount to purchase
 * @param {string} paymentMethod - payment method (e.g., "card", "paypal")
 * @returns {Object} updated wallet
 */
export function purchaseScore(amount, paymentMethod = "card") {
  if (amount <= 0) throw new Error("Purchase amount must be positive");

  const wallet = getWallet();
  const transaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: "purchase",
    amount,
    paymentMethod,
    timestamp: new Date().toISOString(),
  };

  wallet.balance += amount;
  wallet.transactions.push(transaction);
  saveWallet(wallet);

  return wallet;
}

/**
 * Deduct score for content access
 * @param {string} contentId - ID of content to unlock
 * @param {string} contentType - Type of content (book, media, feature)
 * @param {number} amount - score amount to deduct
 * @returns {Object} { success: boolean, message: string, wallet: Object }
 */
export function deductScore(contentId, contentType, amount) {
  if (amount <= 0) throw new Error("Deduction amount must be positive");

  const wallet = getWallet();

  // Check if already unlocked
  const alreadyUnlocked = wallet.transactions.find(
    (t) => t.type === "deduct" && t.contentId === contentId
  );

  if (alreadyUnlocked) {
    return {
      success: false,
      message: "Content already unlocked",
      wallet,
    };
  }

  // Check sufficient balance
  if (wallet.balance < amount) {
    return {
      success: false,
      message: `Insufficient balance. Need ${amount}, have ${wallet.balance}`,
      wallet,
    };
  }

  // Deduct score
  const transaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: "deduct",
    contentId,
    contentType,
    amount,
    timestamp: new Date().toISOString(),
  };

  wallet.balance -= amount;
  wallet.transactions.push(transaction);
  saveWallet(wallet);

  return {
    success: true,
    message: `Successfully unlocked ${contentType}`,
    wallet,
  };
}

/**
 * Check if content is already unlocked
 * @param {string} contentId - ID of content to check
 * @returns {boolean} true if unlocked
 */
export function isContentUnlocked(contentId) {
  const wallet = getWallet();
  return wallet.transactions.some(
    (t) => t.type === "deduct" && t.contentId === contentId
  );
}

/**
 * Get all deduction transactions (purchases of content)
 * @returns {Array} array of deduction transactions
 */
export function getContentTransactions() {
  const wallet = getWallet();
  return wallet.transactions.filter((t) => t.type === "deduct");
}

/**
 * Get all purchase transactions (score purchases)
 * @returns {Array} array of purchase transactions
 */
export function getPurchaseTransactions() {
  const wallet = getWallet();
  return wallet.transactions.filter((t) => t.type === "purchase");
}

/**
 * Reset wallet (for demo/testing only)
 */
export function resetWallet() {
  const newWallet = {
    userId: DEFAULT_USER_ID,
    userName: "User",
    avatar: "default",
    balance: 0,
    transactions: [],
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(newWallet));
  return newWallet;
}

/**
 * Update user avatar
 * @param {string} avatarName - avatar preset name (default, blue, purple, red, orange, green, pink, teal)
 */
export function updateAvatar(avatarName) {
  const wallet = getWallet();
  wallet.avatar = avatarName || "default";
  saveWallet(wallet);
  return wallet;
}

/**
 * Update user name
 * @param {string} name - new user name
 */
export function updateUserName(name) {
  const wallet = getWallet();
  wallet.userName = name || "User";
  saveWallet(wallet);
  return wallet;
}

/**
 * Update user profile (avatar and name)
 * @param {Object} profile - { userName: string, avatar: string }
 */
export function updateUserProfile(profile) {
  const wallet = getWallet();
  if (profile.userName) wallet.userName = profile.userName;
  if (profile.avatar) wallet.avatar = profile.avatar;
  saveWallet(wallet);
  return wallet;
}

export function addAnchors(amount) {
  const wallet = JSON.parse(localStorage.getItem("wallet")) || { anchors: 0 };
  wallet.anchors += amount;
  localStorage.setItem("wallet", JSON.stringify(wallet));
}

export default {
  initializeWallet,
  getWallet,
  saveWallet,
  purchaseScore,
  deductScore,
  isContentUnlocked,
  getContentTransactions,
  getPurchaseTransactions,
  resetWallet,
  updateAvatar,
  updateUserName,
  updateUserProfile,
};
