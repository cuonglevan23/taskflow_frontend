create table if not exists note_attachments
(
    id               bigint auto_increment
        primary key,
    content_type     varchar(255) not null,
    created_at       datetime(6)  not null,
    description      varchar(500) null,
    file_name        varchar(255) not null,
    file_path        varchar(255) not null,
    file_size        bigint       not null,
    stored_file_name varchar(255) not null,
    updated_at       datetime(6)  not null,
    note_id          bigint       not null,
    uploaded_by      bigint       not null,
    constraint UKmktih1bd92ahv01ltx7f2bn5q
        unique (stored_file_name),
    constraint FK7pd5uka0yrlw1p387srl3uhu5
        foreign key (note_id) references notes (id),
    constraint FKkm9cmo3qvxjik12h45c27r1l4
        foreign key (uploaded_by) references users (id)
);

