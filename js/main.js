const { createApp, ref, reactive, computed } = Vue;

createApp({
  setup() {
    const silver = reactive({
      hdzpBg: `url(./img/bj_hdzp_silver.png) 0px 0px / 100% 100%`,
      ljcjBtn: `url(./img/img_zphdljcj_silver.png) 0px 0px / 100% 100%`,
      prizeArea: `url(./img/img_zphdzz_silver.png) 0px 0px / 100% 100%`,
    });

    //   const gold = reactive({
    //     hdzpBg: `url(${imageMap.bj_hdzp_gold}) 0px 0px / 100% 100%`,
    //     ljcjBtn: `url(${imageMap.img_zphdljcj_gold}) 0px 0px / 100% 100%`,
    //     prizeArea: `url(${imageMap.img_zphdzz_gold}) 0px 0px / 100% 100%`,
    //   });

    //   const diamond = reactive({
    //     hdzpBg: `url(${imageMap.bj_hdzp_diamond}) 0px 0px / 100% 100%`,
    //     ljcjBtn: `url(${imageMap.img_zphdljcj_diamond}) 0px 0px / 100% 100%`,
    //     prizeArea: `url(${imageMap.img_zphdzz_diamond}) 0px 0px / 100% 100%`,
    //   });

    const typeData = [
      {
        type: 0,
        luckyValue: 10,
        prizes: {
          bonus: 10,
        },
      },
      {
        type: 1,
        luckyValue: 10,
        prizes: {
          bonus: 10,
        },
      },
      {
        type: 2,
        luckyValue: 10,
        prizes: {
          bonus: 10,
        },
      },
    ];

    const ranDonArr = [360, 36, 72, 108, 144, 180, 216, 252, 288, 324];
    const currentType = ref(silver);
    const luckyRouletteSetting = reactive({
      /**
       * 转盘开关
       *  0 = Silver (白银转盘)
       *  1 = Gold (黄金转盘)
       *  2 = Diamond (钻石转盘)
       */
      isOpen: [],
      /** 转盘配置  */
      items: typeData,
      //   [
      //     {
      //       /**
      //        *  0 = Silver (白银转盘)
      //        *  1 = Gold (黄金转盘)
      //        *  2 = Diamond (钻石转盘)
      //        */
      //       type: 0,
      //       /** 消耗幸运值,建议整形 */
      //       luckyValue: 0,
      //       /**奖励以及概率 */
      //       prizes: {
      //         /** 奖金 */
      //         bonus: 0,
      //       },
      //     },
      //   ]
      /** 幸运值比例，默认1:1 */
      luckyRatio: 0,
      /** 当前幸运值 */
      currentProgress: 0,
    });

    const onChangeType = (type) => {
      /** 当抽奖未结束时禁止切换转盘 */
      if (finishedStatus.value) return;
      active.value = type;

      if (active.value === Promotion.RouletteTypeEnums.Silver) {
        currentType.value = silver;
      } else if (active.value === Promotion.RouletteTypeEnums.Gold) {
        currentType.value = gold;
      } else if (active.value === Promotion.RouletteTypeEnums.Diamond) {
        currentType.value = diamond;
      }
    };

    //#region 轮盘转动逻辑
    /** 轮盘配置 */
    const config = reactive({
      /** 开始角度 */
      begin: 0,
      /** 基础圈数 / 360 */
      basic: 1800,
      /** 旋转结束角度 */
      finishedAngle: 0,
      /** 旋转结束 */
      finishedRun: false,
    });
    /** 抽奖结果模态 */
    const showResult = ref(false);
    // 旋转状态
    const finishedStatus = ref(false);
    const rotateStyle = computed(() => {
      return `rotate(${config.begin}deg)`;
    });

    /** 处理抽奖事件 */
    const handleDrawAward = async () => {
      if (
        luckyRouletteSetting.value.currentProgress <
        turntableList.value.luckyValue
      ) {
        showMessage(t("promotion.roulette.luckyNumberLow"), "error");
        return;
      }
      if (finishedStatus.value) return;
      finishedStatus.value = true;
      setGlobalLoading(true);
      try {
        const res = await drawLuckyWheel(active.value, actionId.value);
        if (!res) return;
        const { bonusAmount, isSuccess, message, bonusIndex, currentProgress } =
          res.data;
        oneBonusAmount.value = Number(bonusAmount);
        if (!isSuccess) {
          showMessage(message, "error");
          return;
        }
        luckyRouletteSetting.value.currentProgress = currentProgress;
        BonusIndex.value = bonusIndex;
        /** 计算旋转下标，并记录，下一次减去上一次即可保证正确旋转 */
        const length = ranDonArr.length;
        const index = bonusIndex === 0 ? 0 : length - bonusIndex;
        run(ranDonArr[index] - currentRotation.value);
        currentRotation.value = ranDonArr[index];
      } catch {
        finishedStatus.value = false;
      } finally {
        setGlobalLoading(false);
      }
    };
    const getRotationStyle = (index) => {
      return `transform: rotate(${ranDonArr[index]}deg)`;
    };
    /** 旋转轮盘 */
    const run = (angle) => {
      let timer;

      config.begin += config.basic + angle;

      timer = setInterval(function () {
        if (config.begin > config.basic + angle) {
          config.finishedAngle = config.begin;
          clearInterval(timer);
        }
      }, 50);
    };

    /** 旋转完成 */
    const onFinishedRun = () => {
      config.finishedRun = true;
    };

    /** 闪烁完成 */
    const onFinishedFlash = () => {
      config.finishedRun = false;
      showResult.value = true;
      finishedStatus.value = false;
      /** 当用户显示的界面是我的记录，完成转盘后刷新记录 */
      if (recordActive.value === 1) {
        onClickTab();
        return;
      }
      /** 当抽到的奖励是后三位，789时，则刷新 */
      BonusIndex.value > 6 ? onClickTab() : null;
    };
    //#endregion

    return {
      config,
      currentType,
      rotateStyle,
      luckyRouletteSetting,
      onChangeType,
      getRotationStyle,
      onFinishedRun,
      onFinishedFlash,
    };
  },
}).mount("#app");
