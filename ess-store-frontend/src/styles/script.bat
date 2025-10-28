@echo off
echo Creating SCSS project structure...

REM Create the empty partial files
echo. > _variables.scss
echo. > _functions.scss
echo. > _animations.scss
echo. > _mixins.scss
echo. > _reset.scss
echo. > _theme.scss
echo. > _typography.scss
echo. > _layout.scss
echo. > _flow.scss

REM Create the main entry file
echo. > main.scss

echo.
echo Structure created successfully inside the 'styles' folder!
cd ..
pause
