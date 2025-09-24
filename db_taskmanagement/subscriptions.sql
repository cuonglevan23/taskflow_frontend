create table if not exists subscriptions
(
    id                     bigint auto_increment
        primary key,
    amount                 decimal(10, 2)                                                                                                                              null,
    canceled_at            datetime(6)                                                                                                                                 null,
    created_at             datetime(6)                                                                                                                                 not null,
    currency               varchar(3)                                                                                                                                  null,
    current_period_end     datetime(6)                                                                                                                                 null,
    current_period_start   datetime(6)                                                                                                                                 null,
    plan_type              enum ('MONTHLY', 'QUARTERLY', 'YEARLY')                                                                                                     not null,
    status                 enum ('ACTIVE', 'CANCELED', 'CANCELLED', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'PAST_DUE', 'PAUSED', 'PENDING_PAYMENT', 'TRIALING', 'UNPAID') not null,
    stripe_customer_id     varchar(255)                                                                                                                                null,
    stripe_price_id        varchar(255)                                                                                                                                null,
    stripe_subscription_id varchar(255)                                                                                                                                null,
    trial_end              datetime(6)                                                                                                                                 null,
    trial_start            datetime(6)                                                                                                                                 null,
    updated_at             datetime(6)                                                                                                                                 null,
    user_id                bigint                                                                                                                                      not null,
    cancellation_reason    varchar(255)                                                                                                                                null,
    start_date             datetime(6)                                                                                                                                 null,
    constraint UKhrjab6j3njsjx6ua50ob6byeu
        unique (stripe_subscription_id),
    constraint FKhro52ohfqfbay9774bev0qinr
        foreign key (user_id) references users (id)
)
    auto_increment = 17;

