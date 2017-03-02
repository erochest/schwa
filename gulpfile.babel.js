// generated on 2015-08-07 using generator-gulp-webapp 1.0.3
import gulp from 'gulp';
import bump from 'gulp-bump';
import filter from 'gulp-filter';
import git from 'gulp-git';
import purescript from 'gulp-purescript';
import run from 'gulp-run';
import runSequence from 'run-sequence';
import tagVersion from 'gulp-tag-version';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';
import fs from 'fs';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const paths = {
  src: 'src/**/*.purs',
  ffi: 'src/**/*.js',
  bowerSrc: 'bower_components/purescript-*/src/**/*.purs',
  bowerFfi: 'bower_components/purescript-*/src/**/*.js',
  dest: './output',
  dist: './app/scripts/main.js',
  docsDest: 'README.md',
  manifests: [
    'bower.json',
    'package.json'
  ],
  deploy: './gh-pages/',
};

const options = {
  compiler: {
    src: [paths.src, paths.bowerSrc],
    ffi: [paths.ffi, paths.bowerFfi]
  },
  bundle: {
    src: paths.dest + '/**/*.js',
    output: paths.dist
  },
  pscDocs: {
    src: paths.src
  }
};

function compile(compiler) {
  return compiler(options.compiler);
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
  return purescript.psc(options.compiler);
});

gulp.task('bundle', () => {
  return purescript.pscBundle(options.bundle);
});

gulp.task('browser', ['make', 'bundle']);

gulp.task('docs', () => {
  return purescript.pscDocs(options.pscDocs);
});

gulp.task('dotpsci', () => {
  return purescript.psci(options.compiler)
    .pipe(gulp.dest('.'));
});

gulp.task('watch-browser', () => {
  gulp.watch(paths.src, ['browser']);
});

gulp.task('watch-make', () => {
  gulp.watch(paths.src, ['make', 'dotPsci']);
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
  }).pipe(gulp.dest('dist/'));
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
  gulp.watch(paths.src, ['browser']);
  gulp.watch(paths.ffi, ['browser']);
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

gulp.task('test', ['make'], () => {
  return purescript.pscBundle({
      src: paths.dest + '/**/*.js',
      main: 'Test.Main'
    })
    .pipe(run('node'));
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

gulp.task('build', ['html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('deploy', () => {
  return runSequence(
      'build'
    //, 'test'
    , 'deploy:push'
    );
});

// There are async issues with this.
gulp.task('deploy:reclone', () => {
  del('./schwa/', { force: true });
  del(paths.deploy, { force: true });
  git.clone('git@github.com:erochest/schwa', { args: '-b gh-pages' }, (e) => {
    console.error(e);
  });
});

gulp.task('deploy:rename', ['deploy:reclone'], () => {
  fs.renameSync('./schwa', paths.deploy);
});

gulp.task('deploy:add', ['deploy:rename'], () => {
  gulp.src('./app/**/*', { dot: true })
    .pipe(gulp.dest(paths.deploy));
});

gulp.task('deploy:commit', ['deploy:add'], () => {
  gulp.src([paths.deploy + '/**/*', '!' + paths.deploy + '/.git/**/*'],
    {
      dot: true,
      nodir: true
    })
    .pipe(git.add({
      cwd: paths.deploy
    }))
    .pipe(git.commit('Deploy', {
      cwd: paths.deploy
    }));
});

gulp.task('deploy:push', ['deploy:commit'], () => {
  return git.push('origin', 'gh-pages', { cwd: paths.deploy });
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
