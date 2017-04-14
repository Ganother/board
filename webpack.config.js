/**
 * Created by ganother on 7/25/16.
 */
var webpack = require('webpack');
var fs = require('fs');
var path = require("path");
var srcDir = './'
var projectRoot = path.resolve(__dirname, '../')

function getEntry() {
  var jsPath = path.resolve(srcDir, 'js');
  var dirs = fs.readdirSync(jsPath);
  var matchs = [], files = {};
  dirs.forEach(function (item) {
    matchs = item.match(/(.+)\.js$/);
    if (matchs) {
      files[matchs[1]] = path.resolve(srcDir, 'js', item);
    }
  });
  return files;
}

module.exports = {
  devtool: "source-map",    //生成sourcemap,便于开发调试
  entry: getEntry(),         //获取项目入口js文件
  output: {
    path: path.join(__dirname, "dist/js"), //文件输出目录
//    publicPath: path.join("dist/js/"),        //用于配置文件发布路径，如CDN或本地服务器
    filename: "[name].js",        //根据入口文件输出的对应多个文件名
  },
  module: {
    //各种加载器，即让各种文件格式可用require引用
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          plugins: [
            "transform-runtime"
          ],
          presets: ['es2015', 'stage-2']
        }
      }
    ]
  },
  resolve: {
    //配置别名，在项目中可缩减引用路径
    alias: {
      // jquery: path.resolve(srcDir, "dist/js/lib/jquery-1.12.4.min.js"),
      // zepto: path.resolve(srcDir, "dist/js/lib/zepto-1.2.0.min.js"),
      module: path.resolve(srcDir, "js/module")
    }
  },
  externals: {
    // require("jquery") is external and available
    //  on the global var jQuery
    // "jquery": "jQuery",
    // "zepto": "Zepto"
  },
  plugins: [
    //js文件的压缩
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
};
