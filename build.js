const UglifyJS = require('uglify-es');
const CleanCSS = require('clean-css');
const fs = require('fs');
const {
  readFileSync,
  writeFileSync,
} = fs;

const toMD5 = data=>require('crypto').createHash('md5').update(data).digest('hex');

const UglifyOptions = {
  parse: {},
  compress: {
    drop_console: false,
  },
  mangle: {},
  output: {
    comments: false,    // 移除注释
  },
  sourceMap: false,
  ecma: 8,  // specify one of: 5, 6, 7 or 8
  keep_fnames: false,   // 防止丢弃或损坏函数名
  keep_classnames: false,
  toplevel: false,    // 混淆最高作用域中的变量和函数名
  warnings: false,
};


const CleanCSSOptions = {
  report: 'min',
  sourceMap: false
};



let sakanaJSCode = readFileSync('html/sakana.js', 'utf8');

const cssTextMinify = new CleanCSS(CleanCSSOptions).minify(readFileSync('html/sakana.css','utf8'));
const cssTextMinifyStyles = cssTextMinify.styles;

sakanaJSCode = sakanaJSCode.replace(
  '/* css */',
  `const styleEl = document.createElement('style');styleEl.innerHTML="${cssTextMinifyStyles}";document.head.appendChild(styleEl);`
);


const fileNames = [
  // 'sakana.css',
  'takina.png',
  'chisato.png',
  'blue00f4.png',
  'sakana.m4a',
  'chinanago.m4a',
];
const Types = {
  png: 'image/png',
  m4a: 'audio/x-m4a',
  css: 'text/css;charset=utf-8'
};
const extRegEx = /\.(.+?)$/;
function getImageType(str){
  const ext = str.match(extRegEx)[1];
  return Types[ext]
}

const fileNamesRegExpG = new RegExp('('+fileNames.join('|')+')','g');
const fileNamesRegExp = new RegExp('('+fileNames.join('|')+')');

// uglify 压缩
const sakanaJSCodeMinify = UglifyJS.minify(sakanaJSCode, UglifyOptions);
const sakanaJSCodeMinifyCode = sakanaJSCodeMinify.code;

const sakanaJSCodeMinifyCodeReplaced = sakanaJSCodeMinifyCode.replace(fileNamesRegExpG,fileName=>{
  const data = readFileSync('html/'+fileName,'binary');
  const buffer = Buffer.from(data, 'binary');
  return 'data:'+ getImageType(fileName) +';base64,'+ buffer.toString('base64') +'';
});

const md5 = toMD5(sakanaJSCodeMinifyCodeReplaced);

console.log(md5)
writeFileSync(`html/sakana.min.js`,sakanaJSCodeMinifyCodeReplaced,'utf8');