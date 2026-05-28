# DevHub

# add react
npx nx add @nx/react
npx nx g @nx/react:app web --bundler=vite --style=css 

# Add NestJS app
npx nx add @nx/nest
npx nx g @nx/nest:app api

# libs
npx nx g @nx/react:lib packages/ui
npx nx g @nx/js:lib utils

# run
npx nx run @dev-hub/web:serve
npx nx run @dev-hub/api:serve

# build
npx nx run @dev-hub/web:build

# tailwind 
npm install tailwindcss @tailwindcss/vite


up coming events :- 
1.add the project
2.list the project
3.when click run then start process (if any error need to alert users)
4.show the local consoles on log on each project / console tab is there shows on there by each project (like cloud watch)
5.stop process
6.build process