import "@jup-ag/terminal/css";

const walletProps = useWallet();
useEffect(() => {
  if (typeof window !== "undefined") {
    import("@jup-ag/terminal").then((mod) => {
      const init = mod.init;
      init({
        displayMode: "integrated",
        integratedTargetId: "integrated-terminal",
        endpoint: "https://api.mainnet-beta.solana.com",
        strictTokenList: false,
        formProps: {
          fixedOutputMint: true,
          swapMode: "ExactIn",
          initialAmount: "1",
          initialOutputMint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
          initialSlippageBps: 5,
        },
      });
    });
  }
}, []);