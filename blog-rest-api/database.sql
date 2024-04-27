CREATE TABLE blog_entries
(
    id     INT NOT NULL,
    title  VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL,
    author INT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO blog_entries (id, title, content, author) VALUES
                                                                 ('1', 'first_title', 'ohjeet', 1),
                                                                 ('2', 'second_title', 'resepteja', 2),
                                                                 ('3', 'third_title', 'testejä', 2),
                                                                 ('4', 'fourth_title', 'harjoitukset', 2);
