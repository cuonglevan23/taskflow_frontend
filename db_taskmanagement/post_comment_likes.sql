create table if not exists post_comment_likes
(
    id         bigint auto_increment
        primary key,
    created_at datetime(6) not null,
    comment_id bigint      not null,
    user_id    bigint      not null,
    constraint UKlaad5t79vnw9p6cfh46tkp5ac
        unique (comment_id, user_id),
    constraint FKolqfg69iiq4kvvhg8pyp9wtwm
        foreign key (comment_id) references post_comments (id),
    constraint FKqhck000tgwtwukoao6chny5s5
        foreign key (user_id) references users (id)
)
    auto_increment = 9;

