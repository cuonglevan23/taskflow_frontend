create table if not exists payments
(
    id                       bigint auto_increment
        primary key,
    amount                   decimal(10, 2)                                                                                      not null,
    created_at               datetime(6)                                                                                         not null,
    currency                 varchar(3)                                                                                          not null,
    description              varchar(255)                                                                                        null,
    failure_reason           varchar(255)                                                                                        null,
    payment_method_type      enum ('BANK_TRANSFER', 'CARD', 'WALLET')                                                            null,
    receipt_url              varchar(255)                                                                                        null,
    refunded_amount          decimal(10, 2) default 0.00                                                                         null,
    status                   enum ('CANCELED', 'FAILED', 'PARTIALLY_REFUNDED', 'PENDING', 'PROCESSING', 'REFUNDED', 'SUCCEEDED') not null,
    stripe_charge_id         varchar(255)                                                                                        null,
    stripe_payment_intent_id varchar(255)                                                                                        null,
    updated_at               datetime(6)                                                                                         null,
    subscription_id          bigint                                                                                              null,
    user_id                  bigint                                                                                              not null,
    constraint UKpuc8mkpduwb4ws7khxcoo0s3t
        unique (stripe_payment_intent_id),
    constraint FKa3xnf2o6mt8cqbewvq2ouq3rq
        foreign key (subscription_id) references subscriptions (id),
    constraint FKj94hgy9v5fw1munb90tar2eje
        foreign key (user_id) references users (id)
)
    auto_increment = 17;

