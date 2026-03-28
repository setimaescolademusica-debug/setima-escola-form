CREATE TABLE `form_respostas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome_completo` varchar(255) NOT NULL,
	`whatsapp` varchar(20) NOT NULL,
	`possui_instrumento` varchar(50) NOT NULL,
	`instrumento` varchar(255) NOT NULL,
	`instrumento_customizado` text,
	`classificacao_vocal` varchar(100),
	`dias_disponiveis` text NOT NULL,
	`melhor_horario` varchar(50) NOT NULL,
	`observacoes` text,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `form_respostas_id` PRIMARY KEY(`id`)
);
