create table if not exists post_comments
(
    id                bigint auto_increment
        primary key,
    content           text        not null,
    created_at        datetime(6) not null,
    like_count        int         not null,
    updated_at        datetime(6) null,
    parent_comment_id bigint      null,
    post_id           bigint      not null,
    user_id           bigint      not null,
    constraint FK21q7y8a124im4g0l4aaxn4ol1
        foreign key (parent_comment_id) references post_comments (id),
    constraint FKaawaqxjs3br8dw5v90w7uu514
        foreign key (post_id) references posts (id),
    constraint FKsnxoecngu89u3fh4wdrgf0f2g
        foreign key (user_id) references users (id)
)
    auto_increment = 44;

