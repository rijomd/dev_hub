# DevHub

# add react
npx nx add @nx/react
npx nx g @nx/react:app web --bundler=vite --style=css 

# Add NestJS app
npx nx add @nx/nest
npx nx g @nx/nest:app api

# libs
npx nx g @nx/react:lib packages/ui

# run
npx nx serve web
npx nx serve api

# build
