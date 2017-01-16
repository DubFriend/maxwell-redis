CREATE DATABASE maxwell;

GRANT ALL on maxwell.* to 'maxwell'@'%' identified by 'password';
GRANT SELECT, REPLICATION CLIENT, REPLICATION SLAVE on *.* to 'maxwell'@'%';

CREATE DATABASE test;
USE test;

CREATE TABLE `a` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8;

CREATE TABLE `b` (
  `id` char(8) NOT NULL DEFAULT '',
  `value` double DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
