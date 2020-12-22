var Key = ''; //单引号内自行填写您抓取的Cookie

var DualKey = ''; //如需双账号签到,此处单引号内填写抓取的"账号2"Cookie, 否则请勿填写

var LogDetails = false; //是否开启响应日志, true则开启

var stop = 0; //自定义延迟签到,单位毫秒. 默认分批并发无延迟. 延迟作用于每个签到接口, 如填入延迟则切换顺序签到(耗时较长), VPN重启或越狱用户建议填写1, Surge用户请注意在SurgeUI界面调整脚本超时

var DeleteCookie = false; //是否清除Cookie, true则开启.

var boxdis = true; //是否开启自动禁用, false则关闭. 脚本运行崩溃时(如VPN断连), 下次运行时将自动禁用相关崩溃接口(仅部分接口启用), 崩溃时可能会误禁用正常接口. (该选项仅适用于QX,Surge,Loon)

var ReDis = false; //是否移除所有禁用列表, true则开启. 适用于触发自动禁用后, 需要再次启用接口的情况. (该选项仅适用于QX,Surge,Loon)

var out = 0; //接口超时退出, 用于可能发生的网络不稳定, 0则关闭. 如QX日志出现大量"JS Context timeout"后脚本中断时, 建议填写6000

var $nobyda = nobyda();

async function all() {
  merge = {};
  switch (stop) {
    case 0:
      await Promise.all([
        JingDongBean(stop), //京东京豆
        JingDongTurn(stop), //京东转盘
        JingDongShake(stop), //京东摇一摇
      ]);
      break;
    default:
      await JingDongBean(stop); //京东京豆
      await JingDongTurn(stop); //京东转盘
      await JingDongShake(stop); //京东摇一摇
      break;
  }
  await Promise.all([
    TotalCash(), //总红包查询
    TotalBean(), //总京豆查询
  ]);
  await notify(); //通知模块
}

function notify() {
  return new Promise(resolve => {
    try {
      var bean = 0;
      var cash = 0;
      var subsidy = 0;
      var success = 0;
      var fail = 0;
      var err = 0;
      var notify = '';
      for (var i in merge) {
        bean += merge[i].bean ? Number(merge[i].bean) : 0
        cash += merge[i].Cash ? Number(merge[i].Cash) : 0
        success += merge[i].success ? Number(merge[i].success) : 0
        fail += merge[i].fail ? Number(merge[i].fail) : 0
        err += merge[i].error ? Number(merge[i].error) : 0
        notify += merge[i].notify ? "\n" + merge[i].notify : ""
      }
      var Cash = merge.TotalCash && merge.TotalCash.TCash ? `${merge.TotalCash.TCash}红包` : ""
      var beans = merge.TotalBean && merge.TotalBean.Qbear ? `${merge.TotalBean.Qbear}京豆${Steel||Cash?`, `:``}` : ""
      var Tbean = bean ? `${bean.toFixed(0)}京豆${steel?", ":""}` : ""
      var TCash = cash ? `${cash.toFixed(2)}红包${subsidy||money?", ":""}` : ""
      var Ts = success ? `成功${success}个${fail||err?`, `:``}` : ``
      var Tf = fail ? `失败${fail}个${err?`, `:``}` : ``
      var Te = err ? `错误${err}个` : ``
      var one = `【签到概览】:  ${Ts+Tf+Te}${Ts||Tf||Te?`\n`:`获取失败\n`}`
      var two = Tbean ? `【签到奖励】:  ${Tbean}\n` : ``
      var three = TCash ? `【其他奖励】:  ${TCash}\n` : ``
      var four = `【账号总计】:  ${beans+Cash}${beans||Cash?`\n`:`获取失败\n`}`
      var disa = $nobyda.disable ? "\n检测到上次执行意外崩溃, 已为您自动禁用相关接口. 如需开启请前往BoxJs ‼️‼️\n" : ""
      var DName = merge.TotalBean && merge.TotalBean.nickname ? merge.TotalBean.nickname : "获取失败"
      var Name = add ? DualAccount ? `【签到号一】:  ${DName}\n` : `【签到号二】:  ${DName}\n` : ""
      console.log("\n" + Name + one + two + three + four + five + disa + notify)
      if ($nobyda.isJSBox) {
        if (add && DualAccount) {
          Shortcut = Name + one + two + three + "\n"
        } else if (!add && DualAccount) {
          $intents.finish(Name + one + two + three + four + five + notify)
        } else if (typeof Shortcut != "undefined") {
          $intents.finish(Shortcut + Name + one + two + three)
        }
      }
      if (!$nobyda.isNode) $nobyda.notify("", "", Name + one + two + three + four + five + disa + notify);
      if (DualAccount) {
        double();
      } else {
        $nobyda.time();
        $nobyda.done();
      }
    } catch (eor) {
      $nobyda.notify("通知模块 " + eor.name + "‼️", JSON.stringify(eor), eor.message)
    } finally {
      resolve()
    }
  });
}

function ReadCookie() {
  DualAccount = true;
  const EnvInfo = $nobyda.isJSBox ? "JD_Cookie" : "CookieJD"
  const EnvInfo2 = $nobyda.isJSBox ? "JD_Cookie2" : "CookieJD2"
  if (DeleteCookie) {
    if ($nobyda.read(EnvInfo) || $nobyda.read(EnvInfo2)) {
      $nobyda.write("", EnvInfo)
      $nobyda.write("", EnvInfo2)
      $nobyda.notify("京东Cookie清除成功 !", "", '请手动关闭脚本内"DeleteCookie"选项')
      $nobyda.done()
      return
    }
    $nobyda.notify("脚本终止", "", '未关闭脚本内"DeleteCookie"选项 ‼️')
    $nobyda.done()
    return
  } else if ($nobyda.isRequest) {
    GetCookie()
    return
  }
  if (Key || $nobyda.read(EnvInfo)) {
    if ($nobyda.isJSBox || $nobyda.isNode) {
      if (Key) $nobyda.write(Key, EnvInfo);
      if (DualKey) $nobyda.write(DualKey, EnvInfo2);
    }
    add = DualKey || $nobyda.read(EnvInfo2) ? true : false
    KEY = Key ? Key : $nobyda.read(EnvInfo)
    out = parseInt($nobyda.read("JD_DailyBonusTimeOut")) || out
    stop = parseInt($nobyda.read("JD_DailyBonusDelay")) || stop
    boxdis = $nobyda.read("JD_Crash_disable") === "false" || $nobyda.isNode || $nobyda.isJSBox ? false : boxdis
    LogDetails = $nobyda.read("JD_DailyBonusLog") === "true" || LogDetails
    ReDis = ReDis ? $nobyda.write("", "JD_DailyBonusDisables") : ""
    all()
  } else {
    $nobyda.notify("京东签到", "", "脚本终止, 未获取Cookie ‼️")
    $nobyda.done()
  }
}

function double() {
  add = true
  DualAccount = false
  if (DualKey || $nobyda.read($nobyda.isJSBox ? "JD_Cookie2" : "CookieJD2")) {
    KEY = DualKey ? DualKey : $nobyda.read($nobyda.isJSBox ? "JD_Cookie2" : "CookieJD2")
    all()
  } else {
    $nobyda.time();
    $nobyda.done();
  }
}

function JingDongBean(s) {
  merge.JDBean = {};
  return new Promise(resolve => {
    if (disable("JDBean")) return resolve()
    setTimeout(() => {
      const JDBUrl = {
        url: 'https://api.m.jd.com/client.action',
        headers: {
          Cookie: KEY
        },
        body: 'functionId=signBeanIndex&appid=ld'
      };
      $nobyda.post(JDBUrl, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const cc = JSON.parse(data)
            const Details = LogDetails ? "response:\n" + data : '';
            if (cc.code == 3) {
              console.log("\n" + "京东商城-京豆Cookie失效 " + Details)
              merge.JDBean.notify = "京东商城-京豆: 失败, 原因: Cookie失效‼️"
              merge.JDBean.fail = 1
            } else if (data.match(/跳转至拼图/)) {
              merge.JDBean.notify = "京东商城-京豆: 失败, 需要拼图验证 ⚠️"
              merge.JDBean.fail = 1
            } else if (data.match(/\"status\":\"?1\"?/)) {
              console.log("\n" + "京东商城-京豆签到成功 " + Details)
              if (data.match(/dailyAward/)) {
                merge.JDBean.notify = "京东商城-京豆: 成功, 明细: " + cc.data.dailyAward.beanAward.beanCount + "京豆 🐶"
                merge.JDBean.bean = cc.data.dailyAward.beanAward.beanCount
              } else if (data.match(/continuityAward/)) {
                merge.JDBean.notify = "京东商城-京豆: 成功, 明细: " + cc.data.continuityAward.beanAward.beanCount + "京豆 🐶"
                merge.JDBean.bean = cc.data.continuityAward.beanAward.beanCount
              } else if (data.match(/新人签到/)) {
                const quantity = data.match(/beanCount\":\"(\d+)\".+今天/)
                merge.JDBean.bean = quantity ? quantity[1] : 0
                merge.JDBean.notify = "京东商城-京豆: 成功, 明细: " + (quantity ? quantity[1] : "无") + "京豆 🐶"
              } else {
                merge.JDBean.notify = "京东商城-京豆: 成功, 明细: 无京豆 🐶"
              }
              merge.JDBean.success = 1
            } else {
              merge.JDBean.fail = 1
              console.log("\n" + "京东商城-京豆签到失败 " + Details)
              if (data.match(/(已签到|新人签到)/)) {
                merge.JDBean.notify = "京东商城-京豆: 失败, 原因: 已签过 ⚠️"
              } else if (data.match(/人数较多|S101/)) {
                merge.JDBean.notify = "京东商城-京豆: 失败, 签到人数较多 ⚠️"
              } else {
                merge.JDBean.notify = "京东商城-京豆: 失败, 原因: 未知 ⚠️"
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-京豆", "JDBean", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function JingDongTurn(s) {
  merge.JDTurn = {}, merge.JDTurn.notify = "", merge.JDTurn.success = 0, merge.JDTurn.bean = 0;
  return new Promise((resolve, reject) => {
    if (disable("JDTurn")) return reject()
    const JDTUrl = {
      url: 'https://api.m.jd.com/client.action?functionId=wheelSurfIndex&body=%7B%22actId%22%3A%22jgpqtzjhvaoym%22%2C%22appSource%22%3A%22jdhome%22%7D&appid=ld',
      headers: {
        Cookie: KEY,
      }
    };
    $nobyda.get(JDTUrl, async function(error, response, data) {
      try {
        if (error) {
          throw new Error(error)
        } else {
          const cc = JSON.parse(data).data.lotteryCode
          const Details = LogDetails ? "response:\n" + data : '';
          if (cc) {
            console.log("\n" + "京东商城-转盘查询成功 " + Details)
            return resolve(cc)
          } else {
            merge.JDTurn.notify = "京东商城-转盘: 失败, 原因: 查询错误 ⚠️"
            merge.JDTurn.fail = 1
            console.log("\n" + "京东商城-转盘查询失败 " + Details)
          }
        }
      } catch (eor) {
        $nobyda.AnError("京东转盘-查询", "JDTurn", eor, response, data)
      } finally {
        reject()
      }
    })
    if (out) setTimeout(reject, out + s)
  }).then(data => {
    return JingDongTurnSign(s, data);
  }, () => {});
}

function JingDongTurnSign(s, code) {
  return new Promise(resolve => {
    setTimeout(() => {
      const JDTUrl = {
        url: `https://api.m.jd.com/client.action?functionId=lotteryDraw&body=%7B%22actId%22%3A%22jgpqtzjhvaoym%22%2C%22appSource%22%3A%22jdhome%22%2C%22lotteryCode%22%3A%22${code}%22%7D&appid=ld`,
        headers: {
          Cookie: KEY,
        }
      };
      $nobyda.get(JDTUrl, async function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const cc = JSON.parse(data)
            const Details = LogDetails ? "response:\n" + data : '';
            const also = merge.JDTurn.notify ? true : false
            if (cc.code == 3) {
              console.log("\n" + "京东转盘Cookie失效 " + Details)
              merge.JDTurn.notify = "京东商城-转盘: 失败, 原因: Cookie失效‼️"
              merge.JDTurn.fail = 1
            } else if (data.match(/(\"T216\"|活动结束)/)) {
              merge.JDTurn.notify = "京东商城-转盘: 失败, 原因: 活动结束 ⚠️"
              merge.JDTurn.fail = 1
            } else if (data.match(/(京豆|\"910582\")/)) {
              console.log("\n" + "京东商城-转盘签到成功 " + Details)
              merge.JDTurn.bean += Number(cc.data.prizeSendNumber) || 0
              merge.JDTurn.notify += `${also?`\n`:``}京东商城-转盘: ${also?`多次`:`成功`}, 明细: ${cc.data.prizeSendNumber||`无`}京豆 🐶`
              merge.JDTurn.success += 1
              if (cc.data.chances != "0") {
                await JingDongTurnSign(2000, code)
              }
            } else if (data.match(/未中奖/)) {
              merge.JDTurn.notify += `${also?`\n`:``}京东商城-转盘: ${also?`多次`:`成功`}, 状态: 未中奖 🐶`
              merge.JDTurn.success += 1
              if (cc.data.chances != "0") {
                await JingDongTurnSign(2000, code)
              }
            } else {
              console.log("\n" + "京东商城-转盘签到失败 " + Details)
              merge.JDTurn.fail = 1
              if (data.match(/(T215|次数为0)/)) {
                merge.JDTurn.notify = "京东商城-转盘: 失败, 原因: 已转过 ⚠️"
              } else if (data.match(/(T210|密码)/)) {
                merge.JDTurn.notify = "京东商城-转盘: 失败, 原因: 无支付密码 ⚠️"
              } else {
                merge.JDTurn.notify += `${also?`\n`:``}京东商城-转盘: 失败, 原因: 未知 ⚠️${also?` (多次)`:``}`
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-转盘", "JDTurn", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function JingDongShake(s) {
  if (!merge.JDShake) merge.JDShake = {}, merge.JDShake.success = 0, merge.JDShake.bean = 0, merge.JDShake.notify = '';
  return new Promise(resolve => {
    if (disable("JDShake")) return resolve()
    setTimeout(() => {
      const JDSh = {
        url: 'https://api.m.jd.com/client.action?appid=vip_h5&functionId=vvipclub_shaking',
        headers: {
          Cookie: KEY,
        }
      };
      $nobyda.get(JDSh, async function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const Details = LogDetails ? "response:\n" + data : '';
            const cc = JSON.parse(data)
            const also = merge.JDShake.notify ? true : false
            if (data.match(/prize/)) {
              console.log("\n" + "京东商城-摇一摇签到成功 " + Details)
              merge.JDShake.success += 1
              if (cc.data.prizeBean) {
                merge.JDShake.bean += cc.data.prizeBean.count || 0
                merge.JDShake.notify += `${also?`\n`:``}京东商城-摇摇: ${also?`多次`:`成功`}, 明细: ${merge.JDShake.bean || `无`}京豆 🐶`
              } else if (cc.data.prizeCoupon) {
                merge.JDShake.notify += `${also?`\n`:``}京东商城-摇摇: ${also?`多次, `:``}获得满${cc.data.prizeCoupon.quota}减${cc.data.prizeCoupon.discount}优惠券→ ${cc.data.prizeCoupon.limitStr}`
              } else {
                merge.JDShake.notify += `${also?`\n`:``}京东商城-摇摇: 成功, 明细: 未知 ⚠️${also?` (多次)`:``}`
              }
              if (cc.data.luckyBox.freeTimes != 0) {
                await JingDongShake(s)
              }
            } else {
              console.log("\n" + "京东商城-摇一摇签到失败 " + Details)
              if (data.match(/true/)) {
                merge.JDShake.notify += `${also?`\n`:``}京东商城-摇摇: 成功, 明细: 无奖励 🐶${also?` (多次)`:``}`
                merge.JDShake.success += 1
                if (cc.data.luckyBox.freeTimes != 0) {
                  await JingDongShake(s)
                }
              } else {
                merge.JDShake.fail = 1
                if (data.match(/(无免费|8000005|9000005)/)) {
                  merge.JDShake.notify = "京东商城-摇摇: 失败, 原因: 已摇过 ⚠️"
                } else if (data.match(/(未登录|101)/)) {
                  merge.JDShake.notify = "京东商城-摇摇: 失败, 原因: Cookie失效‼️"
                } else {
                  merge.JDShake.notify += `${also?`\n`:``}京东商城-摇摇: 失败, 原因: 未知 ⚠️${also?` (多次)`:``}`
                }
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-摇摇", "JDShake", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function JDUserSignPre(s, key, title, ac) {
  merge[key] = {};
  if ($nobyda.isJSBox) {
    return JDUserSignPre2(s, key, title, ac);
  } else {
    return JDUserSignPre1(s, key, title, ac);
  }
}

function JDUserSignPre1(s, key, title, acData, ask) {
  return new Promise((resolve, reject) => {
    if (disable(key, title, 1)) return reject()
    const JDUrl = {
      url: 'https://api.m.jd.com/?client=wh5&functionId=qryH5BabelFloors',
      headers: {
        Cookie: KEY
      },
      opts: {
        'filter': 'try{var od=JSON.parse(body);var params=(od.floatLayerList||[]).filter(o=>o.params&&o.params.match(/enActK/)).map(o=>o.params).pop()||(od.floorList||[]).filter(o=>o.template=="signIn"&&o.signInfos&&o.signInfos.params&&o.signInfos.params.match(/enActK/)).map(o=>o.signInfos&&o.signInfos.params).pop();var tId=(od.floorList||[]).filter(o=>o.boardParams&&o.boardParams.turnTableId).map(o=>o.boardParams.turnTableId).pop();var page=od.paginationFlrs;return JSON.stringify({qxAct:params||null,qxTid:tId||null,qxPage:page||null})}catch(e){return `=> 过滤器发生错误: ${e.message}`}'
      },
      body: `body=${encodeURIComponent(`{"activityId":"${acData}"${ask?`,"paginationParam":"2","paginationFlrs":"${ask}"`:``}}`)}`
    };
    $nobyda.post(JDUrl, async function(error, response, data) {
      try {
        if (error) {
          throw new Error(error)
        } else {
          const od = JSON.parse(data || '{}');
          const turnTableId = od.qxTid || (od.floorList || []).filter(o => o.boardParams && o.boardParams.turnTableId).map(o => o.boardParams.turnTableId).pop();
          const page = od.qxPage || od.paginationFlrs;
          if (data.match(/enActK/)) { // 含有签到活动数据
            let params = od.qxAct || (od.floatLayerList || []).filter(o => o.params && o.params.match(/enActK/)).map(o => o.params).pop()
            if (!params) { // 第一处找到签到所需数据
              // floatLayerList未找到签到所需数据，从floorList中查找
              let signInfo = (od.floorList || []).filter(o => o.template == 'signIn' && o.signInfos && o.signInfos.params && o.signInfos.params.match(/enActK/))
                .map(o => o.signInfos).pop();
              if (signInfo) {
                if (signInfo.signStat == '1') {
                  console.log(`\n${title}重复签到`)
                  merge[key].notify = `${title}: 失败, 原因: 已签过 ⚠️`
                  merge[key].fail = 1
                } else {
                  params = signInfo.params;
                }
              } else {
                merge[key].notify = `${title}: 失败, 活动查找异常 ⚠️`
                merge[key].fail = 1
              }
            }
            if (params) {
              return resolve({
                params: params
              }); // 执行签到处理
            }
          } else if (turnTableId) { // 无签到数据, 但含有关注店铺签到
            const boxds = $nobyda.read("JD_Follow_disable") === "false" ? false : true
            if (boxds) {
              console.log(`\n${title}关注店铺`)
              return resolve(parseInt(turnTableId))
            } else {
              merge[key].notify = `${title}: 失败, 需要关注店铺 ⚠️`
              merge[key].fail = 1
            }
          } else if (page && !ask) { // 无签到数据, 尝试带参查询
            const boxds = $nobyda.read("JD_Retry_disable") === "false" ? false : true
            if (boxds) {
              console.log(`\n${title}二次查询`)
              return resolve(page)
            } else {
              merge[key].notify = `${title}: 失败, 请尝试开启增强 ⚠️`
              merge[key].fail = 1
            }
          } else {
            merge[key].notify = `${title}: 失败, ${!data ? `需要手动执行` : `不含活动数据`} ⚠️`
            merge[key].fail = 1
          }
        }
        reject()
      } catch (eor) {
        $nobyda.AnError(title, key, eor, response, data)
        reject()
      }
    })
    if (out) setTimeout(reject, out + s)
  }).then(data => {
    disable(key, title, 2)
    if (typeof(data) == "object") return JDUserSign1(s, key, title, encodeURIComponent(JSON.stringify(data)));
    if (typeof(data) == "number") return JDUserSign2(s, key, title, data);
    if (typeof(data) == "string") return JDUserSignPre1(s, key, title, acData, data);
  }, () => disable(key, title, 2))
}

function JDUserSignPre2(s, key, title, acData) {
  return new Promise((resolve, reject) => {
    if (disable(key, title, 1)) return reject()
    const JDUrl = {
      url: `https://pro.m.jd.com/mall/active/${acData}/index.html`,
      headers: {
        Cookie: KEY,
      }
    };
    $nobyda.get(JDUrl, async function(error, response, data) {
      try {
        if (error) {
          throw new Error(error)
        } else {
          const act = data.match(/\"params\":\"\{\\\"enActK.+?\\\"\}\"/)
          const turnTable = data.match(/\"turnTableId\":\"(\d+)\"/)
          const page = data.match(/\"paginationFlrs\":\"(\[\[.+?\]\])\"/)
          if (act) { // 含有签到活动数据
            return resolve(act)
          } else if (turnTable) { // 无签到数据, 但含有关注店铺签到
            const boxds = $nobyda.read("JD_Follow_disable") === "false" ? false : true
            if (boxds) {
              console.log(`\n${title}关注店铺`)
              return resolve(parseInt(turnTable[1]))
            } else {
              merge[key].notify = `${title}: 失败, 需要关注店铺 ⚠️`
              merge[key].fail = 1
            }
          } else if (page) { // 无签到数据, 尝试带参查询
            const boxds = $nobyda.read("JD_Retry_disable") === "false" ? false : true
            if (boxds) {
              console.log(`\n${title}二次查询`)
              return resolve(page[1])
            } else {
              merge[key].notify = `${title}: 失败, 请尝试开启增强 ⚠️`
              merge[key].fail = 1
            }
          } else {
            merge[key].notify = `${title}: 失败, ${!data ? `需要手动执行` : `不含活动数据`} ⚠️`
            merge[key].fail = 1
          }
        }
        reject()
      } catch (eor) {
        $nobyda.AnError(title, key, eor, response, data)
        reject()
      }
    })
    if (out) setTimeout(reject, out + s)
  }).then(data => {
    disable(key, title, 2)
    if (typeof(data) == "object") return JDUserSign1(s, key, title, encodeURIComponent(`{${data}}`));
    if (typeof(data) == "number") return JDUserSign2(s, key, title, data)
    if (typeof(data) == "string") return JDUserSignPre1(s, key, title, acData, data)
  }, () => disable(key, title, 2))
}

function JDUserSign1(s, key, title, body) {
  return new Promise(resolve => {
    setTimeout(() => {
      const JDUrl = {
        url: 'https://api.m.jd.com/client.action?functionId=userSign',
        headers: {
          Cookie: KEY
        },
        body: `body=${body}&client=wh5`
      };
      $nobyda.post(JDUrl, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const Details = LogDetails ? `response:\n${data}` : '';
            if (data.match(/签到成功/)) {
              console.log(`\n${title}签到成功(1)${Details}`)
              if (data.match(/\"text\":\"\d+京豆\"/)) {
                merge[key].bean = data.match(/\"text\":\"(\d+)京豆\"/)[1]
              }
              merge[key].notify = `${title}: 成功, 明细: ${merge[key].bean || '无'}京豆 🐶`
              merge[key].success = 1
            } else {
              console.log(`\n${title}签到失败(1)${Details}`)
              if (data.match(/(已签到|已领取)/)) {
                merge[key].notify = `${title}: 失败, 原因: 已签过 ⚠️`
              } else if (data.match(/(不存在|已结束|未开始)/)) {
                merge[key].notify = `${title}: 失败, 原因: 活动已结束 ⚠️`
              } else if (data.match(/\"code\":\"?3\"?/)) {
                merge[key].notify = `${title}: 失败, 原因: Cookie失效‼️`
              } else {
                const ng = data.match(/\"(errorMessage|subCodeMsg)\":\"(.+?)\"/)
                merge[key].notify = `${title}: 失败, ${ng?ng[2]:`原因: 未知`} ⚠️`
              }
              merge[key].fail = 1
            }
          }
        } catch (eor) {
          $nobyda.AnError(title, key, eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

async function JDUserSign2(s, key, title, tid) {
  await new Promise(resolve => {
    $nobyda.get({
      url: `https://jdjoy.jd.com/api/turncard/channel/detail?turnTableId=${tid}`,
      headers: {
        Cookie: KEY
      }
    }, function(error, response, data) {
      resolve()
    })
    if (out) setTimeout(resolve, out + s)
  });
  return new Promise(resolve => {
    setTimeout(() => {
      const JDUrl = {
        url: 'https://jdjoy.jd.com/api/turncard/channel/sign',
        headers: {
          Cookie: KEY
        },
        body: `turnTableId=${tid}`
      };
      $nobyda.post(JDUrl, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const Details = LogDetails ? `response:\n${data}` : '';
            if (data.match(/\"success\":true/)) {
              console.log(`\n${title}签到成功(2)${Details}`)
              if (data.match(/\"jdBeanQuantity\":\d+/)) {
                merge[key].bean = data.match(/\"jdBeanQuantity\":(\d+)/)[1]
              }
              merge[key].notify = `${title}: 成功, 明细: ${merge[key].bean || '无'}京豆 🐶`
              merge[key].success = 1
            } else {
              console.log(`\n${title}签到失败(2)${Details}`)
              if (data.match(/(已经签到|已经领取)/)) {
                merge[key].notify = `${title}: 失败, 原因: 已签过 ⚠️`
              } else if (data.match(/(不存在|已结束|未开始)/)) {
                merge[key].notify = `${title}: 失败, 原因: 活动已结束 ⚠️`
              } else if (data.match(/(没有登录|B0001)/)) {
                merge[key].notify = `${title}: 失败, 原因: Cookie失效‼️`
              } else {
                const ng = data.match(/\"(errorMessage|subCodeMsg)\":\"(.+?)\"/)
                merge[key].notify = `${title}: 失败, ${ng?ng[2]:`原因: 未知`} ⚠️`
              }
              merge[key].fail = 1
            }
          }
        } catch (eor) {
          $nobyda.AnError(title, key, eor, response, data)
        } finally {
          resolve()
        }
      })
    }, 200 + s)
    if (out) setTimeout(resolve, out + s + 200)
  });
}

function TotalBean() {
  merge.TotalBean = {};
  return new Promise(resolve => {
    if (disable("Qbear")) return resolve()
    $nobyda.post({
      url: 'https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2',
      headers: {
        Cookie: KEY,
        Referer: "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2"
      }
    }, (error, response, data) => {
      try {
        if (error) throw new Error(error);
        const Details = LogDetails ? "response:\n" + data : '';
        const cc = JSON.parse(data)
        if (cc.base.jdNum != 0) {
          console.log("\n" + "京东-总京豆查询成功 " + Details)
          merge.TotalBean.Qbear = cc.base.jdNum
        } else {
          console.log("\n" + "京东-总京豆查询失败 " + Details)
        }
        if (data.match(/\"nickname\" ?: ?\"(.+?)\",/)) {
          merge.TotalBean.nickname = cc.base.nickname
        } else if (data.match(/\"no ?login\.?\"/)) {
          merge.TotalBean.nickname = "Cookie失效 ‼️"
        } else {
          merge.TotalBean.nickname = '';
        }
      } catch (eor) {
        $nobyda.AnError("账户京豆-查询", "TotalBean", eor, response, data)
      } finally {
        resolve()
      }
    })
    if (out) setTimeout(resolve, out)
  });
}

function TotalCash() {
  merge.TotalCash = {};
  return new Promise(resolve => {
    if (disable("TCash")) return resolve()
    $nobyda.post({
      url: 'https://api.m.jd.com/client.action?functionId=myhongbao_balance',
      headers: {
        Cookie: KEY
      },
      body: "body=%7B%22fp%22%3A%22-1%22%2C%22appToken%22%3A%22apphongbao_token%22%2C%22childActivityUrl%22%3A%22-1%22%2C%22country%22%3A%22cn%22%2C%22openId%22%3A%22-1%22%2C%22childActivityId%22%3A%22-1%22%2C%22applicantErp%22%3A%22-1%22%2C%22platformId%22%3A%22appHongBao%22%2C%22isRvc%22%3A%22-1%22%2C%22orgType%22%3A%222%22%2C%22activityType%22%3A%221%22%2C%22shshshfpb%22%3A%22-1%22%2C%22platformToken%22%3A%22apphongbao_token%22%2C%22organization%22%3A%22JD%22%2C%22pageClickKey%22%3A%22-1%22%2C%22platform%22%3A%221%22%2C%22eid%22%3A%22-1%22%2C%22appId%22%3A%22appHongBao%22%2C%22childActiveName%22%3A%22-1%22%2C%22shshshfp%22%3A%22-1%22%2C%22jda%22%3A%22-1%22%2C%22extend%22%3A%22-1%22%2C%22shshshfpa%22%3A%22-1%22%2C%22activityArea%22%3A%22-1%22%2C%22childActivityTime%22%3A%22-1%22%7D&client=apple&clientVersion=8.5.0&d_brand=apple&networklibtype=JDNetworkBaseAF&openudid=1fce88cd05c42fe2b054e846f11bdf33f016d676&sign=fdc04c3ab0ee9148f947d24fb087b55d&st=1581245397648&sv=120"
    }, (error, response, data) => {
      try {
        if (error) throw new Error(error);
        const Details = LogDetails ? "response:\n" + data : '';
        if (data.match(/(\"totalBalance\":\d+)/)) {
          console.log("\n" + "京东-总红包查询成功 " + Details)
          const cc = JSON.parse(data)
          merge.TotalCash.TCash = cc.totalBalance
        } else {
          console.log("\n" + "京东-总红包查询失败 " + Details)
        }
      } catch (eor) {
        $nobyda.AnError("账户红包-查询", "TotalCash", eor, response, data)
      } finally {
        resolve()
      }
    })
    if (out) setTimeout(resolve, out)
  });
}

function disable(Val, name, way) {
  const read = $nobyda.read("JD_DailyBonusDisables")
  const annal = $nobyda.read("JD_Crash_" + Val)
  if (annal && way == 1 && boxdis) {
    var Crash = $nobyda.write("", "JD_Crash_" + Val)
    if (read) {
      if (read.indexOf(Val) == -1) {
        var Crash = $nobyda.write(`${read},${Val}`, "JD_DailyBonusDisables")
        console.log(`\n${name}-触发自动禁用 ‼️`)
        merge[Val].notify = `${name}: 崩溃, 触发自动禁用 ‼️`
        merge[Val].error = 1
        $nobyda.disable = 1
      }
    } else {
      var Crash = $nobyda.write(Val, "JD_DailyBonusDisables")
      console.log(`\n${name}-触发自动禁用 ‼️`)
      merge[Val].notify = `${name}: 崩溃, 触发自动禁用 ‼️`
      merge[Val].error = 1
      $nobyda.disable = 1
    }
    return true
  } else if (way == 1 && boxdis) {
    var Crash = $nobyda.write(name, "JD_Crash_" + Val)
  } else if (way == 2 && annal) {
    var Crash = $nobyda.write("", "JD_Crash_" + Val)
  }
  if (read && read.indexOf(Val) != -1) {
    return true
  } else {
    return false
  }
}

function GetCookie() {
  try {
    if ($request.headers && $request.url.match(/api\.m\.jd\.com.*=signBean/)) {
      var CV = $request.headers['Cookie']
      if (CV.match(/pt_key=.+?;/) && CV.match(/pt_pin=.+?;/)) {
        var CookieValue = CV.match(/pt_key=.+?;/)[0] + CV.match(/pt_pin=.+?;/)[0]
        var CK1 = $nobyda.read("CookieJD")
        var CK2 = $nobyda.read("CookieJD2")
        var AccountOne = CK1 ? CK1.match(/pt_pin=.+?;/) ? CK1.match(/pt_pin=(.+?);/)[1] : null : null
        var AccountTwo = CK2 ? CK2.match(/pt_pin=.+?;/) ? CK2.match(/pt_pin=(.+?);/)[1] : null : null
        var UserName = CookieValue.match(/pt_pin=(.+?);/)[1]
        var DecodeName = decodeURIComponent(UserName)
        if (!AccountOne || UserName == AccountOne) {
          var CookieName = " [账号一] ";
          var CookieKey = "CookieJD";
        } else if (!AccountTwo || UserName == AccountTwo) {
          var CookieName = " [账号二] ";
          var CookieKey = "CookieJD2";
        } else {
          $nobyda.notify("更新京东Cookie失败", "非历史写入账号 ‼️", '请开启脚本内"DeleteCookie"以清空Cookie ‼️')
          return
        }
      } else {
        $nobyda.notify("写入京东Cookie失败", "", "请查看脚本内说明, 登录网页获取 ‼️")
        return
      }
      const RA = $nobyda.read(CookieKey);
      if (RA == CookieValue) {
        console.log(`\n用户名: ${DecodeName}\n与历史京东${CookieName}Cookie相同, 跳过写入 ⚠️`)
      } else {
        const WT = $nobyda.write(CookieValue, CookieKey);
        $nobyda.notify(`用户名: ${DecodeName}`, ``, `${RA?`更新`:`写入`}京东${CookieName}Cookie${WT?`成功 🎉`:`失败 ‼️`}`)
      }
    } else if ($request.url === 'http://www.apple.com/') {
      $nobyda.notify("京东签到", "", "类型错误, 手动运行请选择上下文环境为Cron ⚠️");
    } else {
      $nobyda.notify("京东签到", "写入Cookie失败", "请检查匹配URL或配置内脚本类型 ⚠️");
    }
  } catch (eor) {
    $nobyda.write("", "CookieJD")
    $nobyda.write("", "CookieJD2")
    $nobyda.notify("写入京东Cookie失败", "", '已尝试清空历史Cookie, 请重试 ⚠️')
    console.log(`\n写入京东Cookie出现错误 ‼️\n${JSON.stringify(eor)}\n\n${eor}\n\n${JSON.stringify($request.headers)}\n`)
  } finally {
    $nobyda.done()
  }
}
// Modified from yichahucha
function nobyda() {
  const start = Date.now()
  const isRequest = typeof $request != "undefined"
  const isSurge = typeof $httpClient != "undefined"
  const isQuanX = typeof $task != "undefined"
  const isLoon = typeof $loon != "undefined"
  const isJSBox = typeof $app != "undefined" && typeof $http != "undefined"
  const isNode = typeof require == "function" && !isJSBox;
  const NodeSet = 'CookieSet.json'
  const node = (() => {
    if (isNode) {
      const request = require('request');
      const fs = require("fs");
      return ({
        request,
        fs
      })
    } else {
      return (null)
    }
  })()
  const notify = (title, subtitle, message) => {
    if (isQuanX) $notify(title, subtitle, message)
    if (isSurge) $notification.post(title, subtitle, message)
    if (isNode) console.log(`${title}\n${subtitle}\n${message}`)
    if (isJSBox) $push.schedule({
      title: title,
      body: subtitle ? subtitle + "\n" + message : message
    })
  }
  const write = (value, key) => {
    if (isQuanX) return $prefs.setValueForKey(value, key)
    if (isSurge) return $persistentStore.write(value, key)
    if (isNode) {
      try {
        if (!node.fs.existsSync(NodeSet)) node.fs.writeFileSync(NodeSet, JSON.stringify({}));
        const dataValue = JSON.parse(node.fs.readFileSync(NodeSet));
        if (value) dataValue[key] = value;
        if (!value) delete dataValue[key];
        return node.fs.writeFileSync(NodeSet, JSON.stringify(dataValue));
      } catch (er) {
        return AnError('Node.js持久化写入', null, er);
      }
    }
    if (isJSBox) {
      if (!value) return $file.delete(`shared://${key}.txt`);
      return $file.write({
        data: $data({
          string: value
        }),
        path: `shared://${key}.txt`
      })
    }
  }
  const read = (key) => {
    if (isQuanX) return $prefs.valueForKey(key)
    if (isSurge) return $persistentStore.read(key)
    if (isNode) {
      try {
        if (!node.fs.existsSync(NodeSet)) return null;
        const dataValue = JSON.parse(node.fs.readFileSync(NodeSet))
        return dataValue[key]
      } catch (er) {
        return AnError('Node.js持久化读取', null, er)
      }
    }
    if (isJSBox) {
      if (!$file.exists(`shared://${key}.txt`)) return null;
      return $file.read(`shared://${key}.txt`).string
    }
  }
  const adapterStatus = (response) => {
    if (response) {
      if (response.status) {
        response["statusCode"] = response.status
      } else if (response.statusCode) {
        response["status"] = response.statusCode
      }
    }
    return response
  }
  const get = (options, callback) => {
    options.headers['User-Agent'] = 'JD4iPhone/167169 (iPhone; iOS 13.4.1; Scale/3.00)'
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "GET"
      //options["opts"] = {
      //  "hints": false
      //}
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) {
      options.headers['X-Surge-Skip-Scripting'] = false
      $httpClient.get(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isNode) {
      node.request(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function(resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data);
        callback(error, adapterStatus(resp.response), body)
      };
      $http.get(options);
    }
  }
  const post = (options, callback) => {
    options.headers['User-Agent'] = 'JD4iPhone/167169 (iPhone; iOS 13.4.1; Scale/3.00)'
    if (options.body) options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "POST"
      //options["opts"] = {
      //  "hints": false
      //}
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) {
      options.headers['X-Surge-Skip-Scripting'] = false
      $httpClient.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isNode) {
      node.request.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function(resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data)
        callback(error, adapterStatus(resp.response), body)
      }
      $http.post(options);
    }
  }
  const AnError = (name, keyname, er, resp, body) => {
    if (typeof(merge) != "undefined" && keyname) {
      if (!merge[keyname].notify) {
        merge[keyname].notify = `${name}: 异常, 已输出日志 ‼️`
      } else {
        merge[keyname].notify += `\n${name}: 异常, 已输出日志 ‼️ (2)`
      }
      merge[keyname].error = 1
    }
    return console.log(`\n‼️${name}发生错误\n‼️名称: ${er.name}\n‼️描述: ${er.message}${JSON.stringify(er).match(/\"line\"/)?`\n‼️行列: ${JSON.stringify(er)}`:``}${resp&&resp.status?`\n‼️状态: ${resp.status}`:``}${body?`\n‼️响应: ${resp&&resp.status!=503?body:`Omit.`}`:``}`)
  }
  const time = () => {
    const end = ((Date.now() - start) / 1000).toFixed(2)
    return console.log('\n签到用时: ' + end + ' 秒')
  }
  const done = (value = {}) => {
    if (isQuanX) return $done(value)
    if (isSurge) isRequest ? $done(value) : $done()
  }
  return {
    AnError,
    isRequest,
    isJSBox,
    isSurge,
    isQuanX,
    isLoon,
    isNode,
    notify,
    write,
    read,
    get,
    post,
    time,
    done
  }
};
ReadCookie();
