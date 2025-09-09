export const DEFAULT_CHAIN_ID =
  Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID ?? 11155111);

export const ADDRESSES: Record<number, { counter?: `0x${string}` }> = {
  11155111: {
    counter: process.env.NEXT_PUBLIC_COUNTER_ADDRESS as `0x${string}`,
  },
};
