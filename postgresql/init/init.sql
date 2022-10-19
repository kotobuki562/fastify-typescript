--ユーザーの作成
CREATE USER docker;
--DBの作成
CREATE DATABASE docker;
--ユーザーにDBの権限をまとめて付与
GRANT ALL PRIVILEGES ON DATABASE docker TO docker;
--ユーザーを切り替え
\c docker