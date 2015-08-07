// generated on 2015-08-07 using generator-gulp-webapp 1.0.3
import gulp from 'gulp';
import bump from 'gulp-bump';
import filter from 'gulp-filter';
import git from 'gulp-git';
import purescript from 'gulp-purescript';
import runSequence from 'run-sequence';
import tagVersion from 'gulp-tag-version';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const paths = {
  src: 'src/**/*.purs',
  bowerSrc: 'bower_components/purescript-*/src/**/*.purs',
  dest: './app/scripts',
  docsDest: 'README.md',
  manifests: [
    'bower.json',
    'package.json'
  ]
};

const options = {
  compiler: {},
  pscDocs: {}
};

function compile(compiler) {
  var psc = compiler(options.compiler);
  psc.on('error', (e) => {
    console.error(e.message);
    psc.end();
  });
  return gulp.src([paths.src, paths.bowerSrc])
    .pipe(psc)
    .pipe(gulp.dest(paths.dest));
};

function bumpType(type) {
  return () => {
    return gulp.src(paths.manifests)
      .pipe(bump({type: type}))
      .pipe(gulp.dest('./'));
  };
}

gulp.task('tag', () => {
  return gulp.src(paths.manifests)
    .pipe(git.commit('Update versions.'))
    .pipe(filter('bower.json'))
    .pipe(tagVersion());
});

gulp.task('bump-major', bumpType('major'));
gulp.task('bump-minor', bumpType('minor'));
gulp.task('bump-patch', bumpType('patch'));

gulp.task('bump-tag-major', () => { return runSequence('bump-major', 'tag'); });
gulp.task('bump-tag-minor', () => { return runSequence('bump-minor', 'tag'); });
gulp.task('bump-tag-patch', () => { return runSequence('bump-patch', 'tag'); });

gulp.task('make', () => {
  return compile(purescript.pscMake);
});

gulp.task('browser', () => {
  return compile(purescript.psc);
});

gulp.task('docs', () => {
  var pscDocs = purescript.pscDocs(options.pscDocs);
  pscDocs.on('error', (e) => {
    console.error(e.message);
    pscDocs.end();
  });
  return gulp.src(paths.src)
    .pipe(pscDocs)
    .pipe(gulp.dest(paths.docsDest));
});

gulp.task('dotPsci', () => {
  gulp.src([paths.src].concat(paths.bowerSrc))
    .pipe(purescript.dotPsci());
});

gulp.task('watch-browser', () => {
  gulp.watch(paths.src, ['browser', 'docs']);
});

gulp.task('watch-make', () => {
  gulp.watch(paths.src, ['make', 'docs', 'dotPsci']);
});

gulp.task('styles', () => {
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
const testLintOptions = {
  env: {
    mocha: true
  }
};

gulp.task('lint', lint('app/scripts/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('html', ['browser', 'styles'], () => {
  const assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')({
    filter: '**/*.{eot,svg,ttf,woff,woff2}'
  }).concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'fonts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'app/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
  gulp.watch(paths.src, ['browser', 'docs']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
