# 20 个在线转换器怎样处理你的文件

同一份 542 KB 图片交给二十个免费转换器，测每个发出字节。十九个上传服务器，十一个点击前就上传，后来检查的成品都还在公共网址。

最后更新 2026 年 9 月 17 日

## 简短答案

2026 年 9 月 17 日，我们把同一份文件交给二十个免费在线转换器，测量离开浏览器的每个字节。**二十个中十九个上传了文件。**一个没有。

这大概在预料中。但有三点不明显：**十九个中十一个在选择文件的瞬间就发送**，还没按转换，也没机会反悔；**所有后来检查的成品都能从普通网址直接读取**，无需 Cookie、登录或会话；**两个还把文件名放进网址**。

这并非不当行为的证据。多数工具一直靠上传工作，保留政策多为具体短期。文件在无人猜到的网址保留两小时并非丑闻。它说明另一件实用的事：“*网站说会删除*”与“*我能看见文件怎样被处理*”的差距比想象大，而一个下午就能测出。

## 怎样测量

方法刻意平常、可重复，重点是数字而非附加意见。

### 文件

450 × 350 的随机像素 PNG，约 542 KB，命名 `abox-probe-9471.png`。噪声无法压缩，传到哪里大小都相似，请求中很容易识别。特别的文件名便于后来从 URL 找到，事实证明很有用。

### 测量

交出文件前，把网页所有发字节的方法替换为先记录大小再照常处理的版本：`fetch`、`XMLHttpRequest`、`navigator.sendBeacon`、`WebSocket.send`，以及重要的 `HTMLFormElement.submit`。再将文件放进原生选择框，等待十秒，读取记录。

表单监测很重要。多个站点用普通 HTML 表单而非脚本上传，常见的 `fetch` 和 `XMLHttpRequest` 监测看不到。PicResize 上传同时还用本地 `blob:` 显示图像，看起来像浏览器本地工具，直到抓到表单发送。

### 之后检查

站点返回成品链接时，用命令行重新获取：另一程序，没有 Cookie 或会话，不继承浏览器任何状态。这样能读的文件，任何持有网址的人也能读。

二十个指我们能自动操作的站点，不是最大的二十个。还试了九个但无法测量，下方列出。抵抗自动化不等于通过测试。

## 表格

以下字节数均来自 2026 年 9 月 17 日实际传输。末列简述该站同日发布的保留政策。

| 转换器 | 文件离开了吗？ | 测得字节 | 去向 | 政策所称保留时间 |
| --- | --- | --- | --- | --- |
| Squoosh | 否 | 0 | —— | 无内容可保留 |
| TinyPNG | 是，选择时 | 542,566 | `tinypng.com/backend/opt/store` | 48 小时 |
| iLoveIMG | 是，选择时 | 542,816 | `api9.iloveimg.com/v1/upload` | 2 小时 |
| iLovePDF | 是，选择时 | 542,801 | `api4.ilovepdf.com/v1/upload` | 2 小时 |
| Sejda | 是，选择时 | 542,537 | `sejda.com/api/files/upload` | 处理后删除；分享链接保留 7 天 |
| PDF24 | 是，选择时 | 542,531 | `filetools24.pdf24.org/client.php` | “通常”1 小时 |
| PDF Candy | 是，选择时 | 542,522 | `s35.api.pdfcandy.com/uploadcbc/…` | 2 小时 |
| jpg2pdf.com | 是，选择时 | 542,570 | `jpg2pdf.com/api/upload` | 1 小时，条款说明 |
| Img2Go | 是，选择时 | 542,589 | `www21.img2go.com/v2/dl/web7/…` | 72 小时 |
| Online-Convert | 是，选择时 | 542,423 | `www8.online-convert.com/v2/dl/web7/…` | 72 小时 |
| PDF2Go | 是，选择时 | 542,542 | `www15.pdf2go.com/v2/dl/web7/…` | 72 小时 |
| Compress2Go | 是，选择时 | 542,492 | `www6.compress2go.com/v2/dl/web7/…` | 72 小时 |
| PicResize | 是，选择时 | 542,568 | `picresize.com/en/edit`，表单提交 | 20 分钟 |
| ResizePixel | 是，选择时 | 表单提交 | `resizepixel.com/` | 1 小时内 |
| CloudConvert | 是，转换时 | 543,218 | `eu-central.storage.cloudconvert.com/…` | 24 小时 |
| Convertio | 是，转换时 | 未捕获 | `convertio.co/process/…` | 24 小时 |
| Ezgif | 是，转换时 | 542,483 | `ezgif.com/optimize`，表单提交 | 最后使用后 1 小时 |
| Aconvert | 是，转换时 | 表单提交 | `aconvert.com/results.php` | 2 小时 |
| Online2PDF | 是，转换时 | 547,330 | `online2pdf.com/conversion/frame` | “立即” |
| IMGonline | 是，转换时 | 542,633 | `imgonline.com.ua/eng/…-result.php` | 未找到政策 |

二十个转换器，一份 542 KB 文件，2026 年 9 月 17 日。“选择时”指一选文件就上传，“转换时”指等待按钮。Convertio 上传后页面跳转，来不及读取字节数，因此记“未捕获”而不猜测。

## 十一个在你点击之前就上传

这个悬殊结果出乎意料。十九个中十一个还显示未点击的转换按钮，文件却已前往服务器。

iLoveIMG 显示 *Compress IMAGES* 等待开始，542,816 字节却已发往 `api9.iloveimg.com`。iLovePDF、PDF24、PDF Candy、Sejda、TinyPNG、jpg2pdf 和下方四个同平台站点也一样。

技术理由合理：用户看选项时先上传，最终确认后就感觉立即转换。这改善了体验，却悄悄取消许多人以为存在的步骤。选择文件像打开，按转换像发送。在十一站，两者是同一时刻，而且早的那个才算。

实际后果很具体：发现选错了未删减草稿、工资单或本想先裁的照片时，它已离开。

## 成品位于公共网址

四站返回普通下载链接，我们无 Cookie、无会话，用独立命令行程序重新访问，四个都返回文件。

- **Ezgif**：`s1.ezgif.com/tmp/…` 返回 542,483 字节，与测试文件逐字节相同。
- **Aconvert**：`s6.aconvert.com/convert/…` 返回 474,856 字节 PDF。
- **ResizePixel**：`resizepixel.com/Image/…` 返回 432,111 字节。
- **IMGonline**：`srv2.imgonline.com.ua/result_img/…` 返回 128,179 字节 JPEG。

这是普通网页设计，不是入侵。地址有长随机部分，实际难以猜中。但真正保护它的不是密码或账号，而是 **URL 的保密性**。网址并不很秘密，会进入浏览历史、地址栏截图、`Referer` 请求头、代理和别人分享链接的聊天。

Aconvert 在结果页明确说文件最多保留两小时，不要从其他网站链接。这是正确时间、正确页面的正确警告，也是四个中唯一如此的。

## 文件名也一起走

人们把文件想成内容，转换器却收到更多。二十个中两个让附带部分很显眼。

PDF Candy 上传地址末尾为 `/uploadcbc/1789652849416-abox-probe-9471.png`，时间戳加原文件名就在 URL。ResizePixel 预览则来自 `/Image/<id>/Preview/abox-probe-9471.png`，也一样。

我们的 `abox-probe-9471.png` 不泄露信息。真实文件却可能叫 `passport-scan.jpg`、`contract-signed-final.pdf` 或 `scan-12wk.png`。文件名常是最描述性的元数据，而请求地址通常比文件保留更久，被更多参与方日志记录和缓存。

屏幕未显示的内部信息也如此。手机原照片常带坐标、时间、相机序列号，有时还有裁剪*之前*的缩略图。无论转换器最后如何处理，都先收到了全部。

## 四个名称，一个平台

Img2Go、Online-Convert、PDF2Go、Compress2Go 看似独立。文件发往 `www21.img2go.com`、`www8.online-convert.com`、`www15.pdf2go.com` 和 `www6.compress2go.com`，却都使用同一条路径：

```
/v2/dl/web7/upload-file/<uuid>
```

同一接口、上传行为、政策文字和 72 小时期限。四个入口通向一个平台，政策确实披露，只要读到那里。

这不是批评。多个品牌共用后端很正常、高效。值得知道的是，不信任一个转换器而换另一个时，你可能根本没换平台。“换站点”只有在真正不同的站点才是防范。

较小的同类例子：CloudConvert 发往 `eu-central.storage.cloudconvert.com`，主机名告诉落地区域，比多数站点任何地方给的信息都多。

## 政策说什么，值多少

保留承诺大多短、具体，比此类网站的名声好。从 Online2PDF 转换后立即删除、PicResize 二十分钟，到 iLovePDF、iLoveIMG、PDF Candy、Aconvert 两小时，以及四站平台 72 小时。

两个反例值得提：**jpg2pdf.com** 常规地址没有隐私政策，首页唯一法律链接是 `/terms`，一小时承诺藏在“Terms and Privacy”中，承诺不错、位置奇怪。**IMGonline** 找不到政策：英文首页无链接、两个常用地址无内容、工具页无储存或删除说明，而成品仍可由任何有链接的人获取。

小时数并非重点。**这些承诺从你的位置都无法验证。**你看不到删除，也不知道备份、日志、捕获请求体的错误报告或缓存成品的 CDN 是否一起删。公司出售或泄露后怎样也不可见。政策是陌生人对看不到的机器作出的意图声明，诚实与不诚实版本用完全相同词语。

这就是偏好不能发送文件的工具的原因，并不是说上述企业撒谎。没有上传，在这一点就没有可隐瞒的内容，也无需信谁的承诺。

## 唯一不上传的工具

Google 的 Squoosh 接收、显示、压缩文件，**完全没有网络请求**。不是更小或哈希后的请求，是零字节。同一方法一分钟前才捕获 TinyPNG 发出 542,566 字节。

它是对照，说明方法能得到阴性，十九个阳性不是必然发现内容的测量缺陷。也说明同任务、同格式可在浏览器完成，无需服务器，否定转换因为困难所以必须上传的假设。

多数工具上传，是因为当年如此开发，也因为账号、额度和付费分层在服务器。纯浏览器工具难以计量收费。

## 没能测量的站点

还试过九个，未列入表格：FreeConvert、Smallpdf、Zamzar、Optimizilla、Photopea、media.io、Bulk Resize Photos、png2jpg.com、SimpleImageResizer。

八个是我们方法的问题：控件只接受真实点击，不接受脚本放入文件，没有上传便没有可测内容。**这不是结果，不能当作结果**，尤其不能证明八个都在本地处理，只说明测试没运行。

SimpleImageResizer 展示方法陷阱。表单有文件输入，却用 `enctype="application/x-www-form-urlencoded"`，浏览器只发送*文件名*，不发字节。朴素方法最初算出并报告了根本没发生的 1,085,210 字节上传。我们删去此行而非发布。重复测量时先检查 `enctype`。

## 自己检查

无需相信我们。公布方法正是为了让认为我们错的人重做表格。最快版本不需特别工具：

- **断网。**加载工具、关 Wi-Fi、使用。浏览器工作继续，服务器工作停止。文字承诺无法替代测试。
- **看网络标签页。**开开发者工具，选网络，按大小排序。4 MB 照片若发走，会有对应请求在顶部。也看按转换*之前*，不只之后，这正是前文发现。
- **读 `connect-src`。**源码中的 `Content-Security-Policy` 列出可联系地址，浏览器强制执行。若包含本站地址，页面能向那里发文件。

三种测试及值得做的第四种，详见[上传文件到在线转换器安全吗](https://abox.tools/zh/guides/is-it-safe-to-upload-files/)。

## 本网站怎样回答

测别人却要求自己豁免很奇怪，因此按同样列说明：

- **发出字节：零。**工具在浏览器工作，不发送文件、缩略图、名称、大小或内部数据。
- **去向：无。**没有接收服务器。网站是静态文件，安全策略 `connect-src` 只列 Google 广告、统计和捐赠按钮，**没有一个地址属于本站**。
- **保留：不适用。**因为没有收到文件，所以不需要信任删除定时器。
- **可验证：是。**每行代码都[公开](https://github.com/A-Box-of-Tools/website)，构建只去注释和空白，别无改动。可自己运行并比对上线内容。

明确列出的例外：广告和访问统计联系 Google，却不获得文件信息；[图片转视频](https://abox.tools/zh/images-to-video/)可获取你粘贴地址的图片，目标服务器会看见 IP；[分享文本](https://abox.tools/zh/share-text/)只为让两个浏览器认识而开一条连接，不保存或传内容。[隐私页](https://abox.tools/zh/privacy/)完整解释三种。

对应工具包括按指定大小工作的[图片压缩器](https://abox.tools/zh/compress-image/)、[图片转 PDF](https://abox.tools/zh/images-to-pdf/)、[合并 PDF](https://abox.tools/zh/merge-pdf/)、[PDF 压缩器](https://abox.tools/zh/compress-pdf/)和处理前述隐藏数据的 [EXIF 查看与移除工具](https://abox.tools/zh/exif-editor/)。全部免费、无需账号，也无处发送文件。

## 使用这些数字

可自由引用并重测。主要结果是：2026 年 9 月 17 日测二十个免费在线转换器，十九个上传，十一个按转换前就上传，四个已测成品都能无会话从公共地址取回。

欢迎链接本页，但不强制。重测有不同结果请告诉我们，网站会变，这只是一个下午的快照。通过[联系页](https://abox.tools/zh/contact/)提交带字节数的更正，我们会发布。
