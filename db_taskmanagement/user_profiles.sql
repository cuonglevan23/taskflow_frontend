create table if not exists user_profiles
(
    id                 bigint auto_increment
        primary key,
    about_me           text                       null,
    avt_url            varchar(255)               null,
    department         varchar(255)               null,
    first_name         varchar(255)               null,
    is_upgraded        bit         default b'0'   null,
    job_title          varchar(255)               null,
    last_name          varchar(255)               null,
    status             varchar(255)               null,
    username           varchar(255)               null,
    user_id            bigint                     not null,
    cover_image_s3_key varchar(255)               null,
    cover_image_url    varchar(255)               null,
    github_url         varchar(255)               null,
    is_premium         bit         default b'0'   null,
    linkedin_url       varchar(255)               null,
    premium_expiry     datetime(6)                null,
    premium_plan_type  varchar(255)               null,
    show_department    bit         default b'1'   null,
    show_email         bit         default b'1'   null,
    theme_color        varchar(255)               null,
    website_url        varchar(255)               null,
    preferred_language varchar(10) default 'EN'   null,
    preferred_theme    varchar(10) default 'DARK' null,
    constraint UKe5h89rk3ijvdmaiig4srogdc6
        unique (user_id),
    constraint FKjcad5nfve11khsnpwj1mv8frj
        foreign key (user_id) references users (id)
)
    auto_increment = 4;

