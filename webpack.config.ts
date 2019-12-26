// webpack v4
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import * as CopyPlugin from 'copy-webpack-plugin';
import * as FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as imageminMozjpeg from 'imagemin-mozjpeg';
import ImageminPlugin from 'imagemin-webpack-plugin';
import { join, resolve } from 'path';
import * as PostcssPresetEnv from 'postcss-preset-env';
import WebpackDeepScopeAnalysisPlugin from 'webpack-deep-scope-plugin';
import * as WriteFilePlugin from 'write-file-webpack-plugin';

import { config } from './src/config';

const srcDir = resolve( __dirname, 'src' );
const publicDir = resolve( __dirname, 'public' );
const jsDir = join( srcDir, 'scripts' );
const assetsDir = join( srcDir, 'assets' );
const imagesDir = join( assetsDir, 'images' );
const filesDir = join( assetsDir, 'files' );
const viewsDir = join( srcDir, 'views' );
const partialsDir = join( viewsDir, 'partials' );
const helpersDir = join( viewsDir, 'helpers' );

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = {
  mode: nodeEnv,
  entry: [ join( jsDir, 'main' ) ],
  output: { path: publicDir, filename: '[name].[hash].js', publicPath: '/' },
  resolve: { extensions: [ '.ts', '.tsx', '.js' ] },
  devServer: { port: process.env.PORT, open: true },
  module: {
    rules: [
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader',
        query: { partialDirs: [ partialsDir ], helperDirs: [ helpersDir ] }
      },
      { test: /\.js$/, exclude: /node_modules/, use: { loader: 'babel-loader' } },
      { test: /\.tsx?$/, loader: 'ts-loader' }, {
        test: /\.css$/,
        use: [
          // {
          //   loader: MiniCssExtractPlugin.loader
          // },
          'style-loader', 'css-loader', {
            loader: 'postcss-loader',
            options: { ident: 'postcss', plugins: () => [ PostcssPresetEnv() ] }
          }
        ]
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          'style-loader', 'css-loader', {
            loader: 'postcss-loader',
            options: { ident: 'postcss', plugins: () => [ PostcssPresetEnv() ] }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          'file-loader',
          { loader: 'image-webpack-loader', options: { bypassOnDebug: true } }
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot|otf)(\?v=\d+\.\d+\.\d+)?$/,
        use: [ {
          loader: 'file-loader',
          options: { name: '[name].[ext]', outputPath: 'fonts/' }
        } ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(), new WebpackDeepScopeAnalysisPlugin(),
    new WriteFilePlugin( {
      // We need the files in dev mode due to handlebars partial...
      test: /\.hbs$/
    } ),
    new HtmlWebpackPlugin( {
      template: join( partialsDir, 'head.hbs' ),
      title: config.title,
      meta: { description: config.description },
      inject: 'head',
      filename:
        join( partialsDir, 'webpack.hbs' )  // Write the handlebars to the
      // partials dir instead of public
    } ),
    new ImageminPlugin( {
      test: /\.(jpe?g|png|gif|svg)$/i,
      pngquant: { quality: '50-100' },
      plugins: [ imageminMozjpeg( { quality: 50 } ) ]
    } ),
    new FaviconsWebpackPlugin( {
      logo: join( imagesDir, 'favicon.png' ),
      inject: true,
      favicons: { icons: { appleIcon: false } }
    } ),
    new CopyPlugin( [
      { from: filesDir, to: join( publicDir, 'files' ) },
    ] )
  ]
};