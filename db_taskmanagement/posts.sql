create table if not exists posts
(
    id                bigint auto_increment
        primary key,
    comment_count     int                                   not null,
    content           text                                  null,
    created_at        datetime(6)                           not null,
    image_s3_key      varchar(500)                          null,
    image_url         varchar(500)                          null,
    is_pinned         bit                                   not null,
    like_count        int                                   not null,
    privacy           enum ('FRIENDS', 'PRIVATE', 'PUBLIC') not null,
    updated_at        datetime(6)                           null,
    author_id         bigint                                not null,
    linked_project_id bigint                                null,
    linked_task_id    bigint                                null,
    constraint FK4gpa9a8c373pieossrvhl9h2c
        foreign key (linked_task_id) references tasks (id),
    constraint FK6xvn0811tkyo3nfjk2xvqx6ns
        foreign key (author_id) references users (id),
    constraint FKt2hwvvtqnutm4fls2eydl8arn
        foreign key (linked_project_id) references projects (id)
)
    auto_increment = 53;

