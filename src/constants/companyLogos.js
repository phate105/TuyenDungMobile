export const COMPANY_LOGOS = {
  "assets/logos/cmc.png": require("../../assets/logos/cmc.png"),
  "assets/logos/coccoc.png": require("../../assets/logos/coccoc.png"),
  "assets/logos/coolmate.png": require("../../assets/logos/coolmate.png"),
  "assets/logos/datBike.png": require("../../assets/logos/datBike.png"),
  "assets/logos/fpt.png": require("../../assets/logos/fpt.png"),
  "assets/logos/ghn.png": require("../../assets/logos/ghn.png"),
  "assets/logos/gotIt.png": require("../../assets/logos/gotIt.png"),
  "assets/logos/honda2.png": require("../../assets/logos/honda2.png"),
  "assets/logos/kiotviet.jpg": require("../../assets/logos/kiotviet.jpg"),
  "assets/logos/kyna.png": require("../../assets/logos/kyna.png"),
  "assets/logos/longChau.png": require("../../assets/logos/longChau.png"),
  "assets/logos/manabie.png": require("../../assets/logos/manabie.png"),
  "assets/logos/mb.png": require("../../assets/logos/mb.png"),
  "assets/logos/mindx.jpg": require("../../assets/logos/mindx.jpg"),
  "assets/logos/missa.png": require("../../assets/logos/missa.png"),
  "assets/logos/momo.png": require("../../assets/logos/momo.png"),
  "assets/logos/nashtech.png": require("../../assets/logos/nashtech.png"),
  "assets/logos/pharrmacy.png": require("../../assets/logos/pharrmacy.png"),
  "assets/logos/rkei.png": require("../../assets/logos/rkei.png"),
  "assets/logos/sapo.png": require("../../assets/logos/sapo.png"),
  "assets/logos/shopee.png": require("../../assets/logos/shopee.png"),
  "assets/logos/techcombank.jpg": require("../../assets/logos/techcombank.jpg"),
  "assets/logos/TGDD.jpg": require("../../assets/logos/TGDD.jpg"),
  "assets/logos/TPBank.jpg": require("../../assets/logos/TPBank.jpg"),
  "assets/logos/vietcombank.jpg": require("../../assets/logos/vietcombank.jpg"),
  "assets/logos/viettel.png": require("../../assets/logos/viettel.png"),
  "assets/logos/viettelpost.png": require("../../assets/logos/viettelpost.png"),
  "assets/logos/vinfast.png": require("../../assets/logos/vinfast.png"),
  "assets/logos/vng.png": require("../../assets/logos/vng.png"),
  "assets/logos/vnpay.jpg": require("../../assets/logos/vnpay.jpg"),
  "assets/logos/vnpost.jpg": require("../../assets/logos/vnpost.jpg"),
  "assets/logos/vpbank.jpg": require("../../assets/logos/vpbank.jpg"),
  "assets/logos/win.png": require("../../assets/logos/win.png"),
  "assets/logos/yamaha2.png": require("../../assets/logos/yamaha2.png"),
  "assets/logos/yody.png": require("../../assets/logos/yody.png"),
  "assets/logos/zalo.png": require("../../assets/logos/zalo.png"),
};

export function getCompanyLogoSource(logoPath) {
  if (!logoPath) {
    return null;
  }

  const assetSource = COMPANY_LOGOS[logoPath];
  if (assetSource) {
    return assetSource;
  }

  if (typeof logoPath === "string" && /^(file|content|https?):\/\//i.test(logoPath)) {
    return { uri: logoPath };
  }

  return null;
}
