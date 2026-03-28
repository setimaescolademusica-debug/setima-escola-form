CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`acao` varchar(50) NOT NULL,
	`tabela` varchar(100) NOT NULL,
	`registro_id` int NOT NULL,
	`dados_backup` text NOT NULL,
	`motivo` text,
	`deletado_por` varchar(255),
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
