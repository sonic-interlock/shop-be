create table products (
    id serial primary key,
    title text not null,
    description text,
    price integer
);

create table stocks (
    id serial primary key,
    count integer,
    product_id serial,
    foreign key ("product_id") references "products" ("id")
);

insert into products (id, title, description, price) values
(1, 'Oliver', 'Red cat', 10),
(2, 'Leo', 'White cat', 20),
(3, 'Milo', 'Sand cat', 30),
(4, 'Simba', 'Gray cat', 40),
(5, 'Tiger', 'Black cat', 50);

insert into stocks (product_id, count) values
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);