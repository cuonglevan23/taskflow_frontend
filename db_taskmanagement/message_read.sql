create table if not exists message_read
(
    id           bigint auto_increment
        primary key,
    delivered_at datetime(6)                        null,
    read_at      datetime(6)                        null,
    status       enum ('DELIVERED', 'READ', 'SENT') not null,
    updated_at   datetime(6)                        null,
    message_id   bigint                             not null,
    user_id      bigint                             not null,
    constraint FK26li5gh7io7navapblnpehhoh
        foreign key (user_id) references users (id),
    constraint FKiw48hcrtmjt2grl8dblp3jaky
        foreign key (message_id) references messages (id)
)
    auto_increment = 911;

