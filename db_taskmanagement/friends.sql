create table if not exists friends
(
    id          bigint auto_increment
        primary key,
    accepted_at datetime(6)                                         null,
    created_at  datetime(6)                                         not null,
    status      enum ('ACCEPTED', 'BLOCKED', 'PENDING', 'REJECTED') not null,
    updated_at  datetime(6)                                         null,
    friend_id   bigint                                              not null,
    user_id     bigint                                              not null,
    constraint UKk3jl1difk6e2tixicas048c9o
        unique (user_id, friend_id),
    constraint FKc42eihjtiryeriy8axlkpejo7
        foreign key (friend_id) references users (id),
    constraint FKlh21lfp7th1y1tn9g63ihkda9
        foreign key (user_id) references users (id)
)
    auto_increment = 4;

