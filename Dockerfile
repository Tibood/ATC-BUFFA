# Utiliser une image nginx légère pour servir les fichiers statiques
FROM nginx:alpine

# Copier tous les fichiers du projet dans le répertoire nginx
COPY . /usr/share/nginx/html/

# Exposer le port 80
EXPOSE 80

# Nginx démarre automatiquement avec l'image alpine
CMD ["nginx", "-g", "daemon off;"]
