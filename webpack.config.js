const path = require('path');
const os = require('os');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const uglify = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: './src/scripts/main.js',
    output: {
        filename: 'scripts/[name].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: process.env.NODE_ENV === 'production'
            ? '/h5/music_box/'
            : '/',
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [ {
                    loader: 'html-loader',
                    options: {
                        // minimize: true
                    }
                }]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                      presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [ 'css-loader',{
                        loader: 'postcss-loader',
                        options: {
                          plugins: [
                            require('cssnano')(),
                            require('autoprefixer')({
                              "browsers": [
                                "defaults",
                                "not ie < 11",
                                "last 2 versions",
                                "> 1%",
                                "iOS 7",
                                "last 3 iOS versions"
                              ]
                            })
                          ]
                        }
                    },'less-loader']
                })
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: 'images/[name]_[hash:8].[ext]',
                            limit: 4096
                        }
                    }
                ]
            },
            {
                test: require.resolve('zepto'),
                loader: 'exports-loader?window.Zepto!script-loader'
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        },
        extensions: ['*', '.js', '.vue', '.json']
    },
    devtool: 'source-map',
    devServer: {
        contentBase: './dist',
        host: getLocalIP()
    },
    plugins: [
        //清除多余的文件
        new CleanWebpackPlugin(['dist']),
        //将打包后js和css文件自动添加到HTML页面中
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        //将css生成单独文件
        new ExtractTextPlugin('css/main.css'),
        //将js进行压缩混淆
        new uglify()
    ]
};

//获取局域网ip
function getLocalIP() {
  let iptable={},
      ifaces=os.networkInterfaces();
  for (var dev in ifaces) {
    ifaces[dev].forEach(function(details,alias){
      if (details.family=='IPv4') {
        iptable[dev+(alias?':'+alias:'')]=details.address;
      }
    });
  }
  return iptable['en0:1'];
}