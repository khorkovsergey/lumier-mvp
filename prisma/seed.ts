import { PrismaClient, ReaderTier, SessionType, SessionStatus, OrderStatus, AsyncReadingStatus, SenderType } from '@prisma/client'
import { createHash, randomBytes } from 'crypto'

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha256').update(salt + password).digest('hex')
  return `${salt}:${hash}`
}

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.message.deleteMany()
  await prisma.asyncReading.deleteMany()
  await prisma.order.deleteMany()
  await prisma.session.deleteMany()
  await prisma.question.deleteMany()
  await prisma.insightArticle.deleteMany()
  await prisma.tarotReader.deleteMany()
  await prisma.user.deleteMany()

  // ─── Создаём пользователей-ридеров ───────────────────────────────────────────
  const readersData = [
    {
      name: 'Элара Восс',
      email: 'elara@lumier.com',
      password: 'reader123',
      specialization: 'Отношения и эмоциональная ясность',
      tier: ReaderTier.MASTER,
      price: 120,
      rating: 4.97,
      bio: '14 лет практики. Элара привносит глубину в вопросы любви, партнёрства и самооценки. Её расклады известны точностью и долгим резонансом.',
    },
    {
      name: 'Маркус Тиль',
      email: 'marcus@lumier.com',
      password: 'reader123',
      specialization: 'Карьера и жизненное направление',
      tier: ReaderTier.SENIOR,
      price: 85,
      rating: 4.89,
      bio: 'Маркус соединяет классическую методологию таро с интуитивным ощущением времени и возможностей. Идеален для тех, кто стоит на профессиональном перепутье.',
    },
    {
      name: 'Солин Пак',
      email: 'solin@lumier.com',
      password: 'reader123',
      specialization: 'Духовный рост и внутренняя работа',
      tier: ReaderTier.MASTER,
      price: 140,
      rating: 4.95,
      bio: 'Солин создаёт пространство для глубокого самоисследования, помогая клиентам проходить через трансформацию, утрату и пробуждение с ясностью и состраданием.',
    },
    {
      name: 'Надия Орель',
      email: 'nadia@lumier.com',
      password: 'reader123',
      specialization: 'Ежедневное руководство и практическое видение',
      tier: ReaderTier.FOUNDATION,
      price: 55,
      rating: 4.82,
      bio: 'Надия предлагает заземлённые, конкретные расклады для повседневных вопросов. Ясная, тёплая и неизменно точная.',
    },
    {
      name: 'Джеймс Каллоуэй',
      email: 'james@lumier.com',
      password: 'reader123',
      specialization: 'Теневая работа и бессознательные паттерны',
      tier: ReaderTier.SENIOR,
      price: 95,
      rating: 4.91,
      bio: 'Бывший юнгианский терапевт, ставший читателем. Джеймс мастерски раскрывает скрытые мотивации и повторяющиеся паттерны, блокирующие рост.',
    },
  ]

  const readers = await Promise.all(
    readersData.map(r =>
      prisma.user.create({
        data: {
          name: r.name,
          email: r.email,
          passwordHash: hashPassword(r.password),
          role: 'READER',
          readerProfile: {
            create: {
              name: r.name,
              specialization: r.specialization,
              tier: r.tier,
              price: r.price,
              rating: r.rating,
              bio: r.bio,
              imageUrl: null,
              isActive: true,
            },
          },
        },
        include: { readerProfile: true },
      })
    )
  )

  // ─── Статьи ───────────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.insightArticle.create({
      data: {
        title: 'Искусство верного вопроса',
        preview: 'Качество вашего расклада начинается задолго до того, как карты вытянуты. Оно начинается с того, как вы формулируете то, что хотите понять.',
        content: `Качество вашего расклада начинается задолго до того, как карты вытянуты. Оно начинается с того, как вы формулируете то, что хотите понять.

Большинство людей обращаются к таро с вопросами, ориентированными на результат: «Получу ли я эту работу?» или «Любит ли он меня?» Такие вопросы выносят вашу волю за скобки.

**От результата к пониманию**

Вместо «Получу ли я работу?» попробуйте: «Что мне важно понять об этой возможности и моей готовности к ней?»

Вместо «Любит ли он меня?» — «Что я не вижу ясно в динамике этих отношений?»

**Зона продуктивной неопределённости**

Лучшие вопросы находятся в том, что я называю зоной продуктивной неопределённости — они о чём-то, что действительно важно для вас, где у вас есть реальные ставки и пространство для роста.

Если вы уже знаете ответ, расклад будет плоским. Золотая середина — это вопрос, который вам немного неловко произносить вслух.`,
        category: 'practice',
        readTime: 4,
      },
    }),
    prisma.insightArticle.create({
      data: {
        title: 'Когда расклад не резонирует',
        preview: 'Не каждый расклад попадает сразу. Вот как работать с тем, что кажется мимо — и что это может говорить вам.',
        content: `Не каждый расклад попадает сразу. Иногда карты кажутся случайными, оторванными от вашего вопроса или попросту неверными.

Это информативнее, чем резонирующий расклад — если вы умеете с этим работать.

**Сопротивление как сигнал**

Когда расклад не резонирует, первый импульс — отмахнуться от него. Не торопитесь. Задержитесь на дискомфорте. Спросите себя: этот расклад неверен — или он говорит не то, что я хотел услышать?

**Буквальное и символическое**

Таро говорит прежде всего метафорами. Карта с изображением конфликта необязательно указывает на внешний конфликт — она может указывать на внутреннее напряжение, которое вы подавляете.

Если расклад кажется неверным, попробуйте читать каждую карту на уровень абстрактнее первой интерпретации.`,
        category: 'practice',
        readTime: 5,
      },
    }),
    prisma.insightArticle.create({
      data: {
        title: 'Понимание уровней читателей',
        preview: 'Что отличает читателя Foundation от Мастера? Не только годы — но и глубина, которую каждый привносит в разные вопросы.',
        content: `Выбор читателя — это не только бюджет. Каждый уровень предлагает качественно иное.

**Читатели Foundation**

Идеальны для: ежедневного руководства, решений с чёткими параметрами. Что они предлагают: заземлённые, конкретные расклады.

**Читатели Senior**

Идеальны для: динамики отношений, профессиональных поворотов, вопросов с многослойными эмоциональными ставками.

**Мастера**

Мастера работают преимущественно с вопросами трансформации. Идеальны для: крупных жизненных переходов, давних паттернов, горя.`,
        category: 'guide',
        readTime: 5,
      },
    }),
    prisma.insightArticle.create({
      data: {
        title: 'Об этике вопросов о времени',
        preview: 'Вопросы о «когда» — одни из самых частых и самых непонятых.',
        content: `«Когда это произойдёт?» — один из самых частых вопросов читателям и один из самых сложных для честного ответа.

**Как таро относится ко времени**

Таро не читает фиксированную временную шкалу — оно читает текущие траектории. Карты раскрывают то, что вероятно развернётся при нынешних условиях.

**Задавайте лучшие вопросы о времени**

Вместо «когда я встречу партнёра?» попробуйте: «Какие условия должны сложиться, чтобы я был готов к серьёзным отношениям?»

Это даёт вам что-то, с чем можно работать.`,
        category: 'insight',
        readTime: 6,
      },
    }),
    prisma.insightArticle.create({
      data: {
        title: 'Подготовка к живой сессии',
        preview: 'Живой расклад вознаграждает подготовку.',
        content: `Живой расклад — это разговор, а не выступление. Ваша подготовка напрямую влияет на его качество.

**Накануне вечером**

Уделите десять минут своему вопросу. Запишите его. Не отполированную версию — сырую. Затем посмотрите на него и спросите: что я на самом деле спрашиваю?

**Прийти в нужном состоянии**

Вам не нужно быть спокойным, чтобы получить хороший расклад. Вам нужно быть присутствующим.

**Во время сессии**

Говорите, что замечаете. Если слова читателя не попадают — скажите об этом. Живой расклад точнее, когда он действительно отзывчив.`,
        category: 'guide',
        readTime: 5,
      },
    }),
  ])

  // ─── Демо-клиент ─────────────────────────────────────────────────────────────
  const demoClient = await prisma.user.create({
    data: {
      name: 'Демо Клиент',
      email: 'client@lumier.com',
      passwordHash: hashPassword('client123'),
      role: 'CLIENT',
      dateOfBirth: new Date('1990-06-15'),
    },
  })

  // ─── Демо-вопрос ─────────────────────────────────────────────────────────────
  await prisma.question.create({
    data: {
      userId: demoClient.id,
      text: 'Я стою на перепутье в карьере. Что мне важно понять об этом выборе?',
      category: 'career',
    },
  })

  // ─── Демо-сессия (завершённый async расклад) ──────────────────────────────────
  const reader1Profile = readers[1].readerProfile!
  const demoSession = await prisma.session.create({
    data: {
      userId: demoClient.id,
      readerId: reader1Profile.id,
      type: SessionType.ASYNC,
      status: SessionStatus.COMPLETED,
    },
  })

  await prisma.order.create({
    data: {
      userId: demoClient.id,
      sessionId: demoSession.id,
      amount: 85,
      status: OrderStatus.PAID,
    },
  })

  await prisma.asyncReading.create({
    data: {
      sessionId: demoSession.id,
      status: AsyncReadingStatus.COMPLETED,
      completedAt: new Date(),
      resultText: `**Ваш расклад: На перепутье**

*Для вашего вопроса были вытянуты три карты.*

---

**Позиция 1 — Где вы стоите: Восьмёрка Пентаклей**

Вы создали подлинное мастерство на своём нынешнем месте. Эта карта подтверждает: вы уходите не потому, что потерпели поражение. Вы действительно овладели чем-то важным.

---

**Позиция 2 — Куда вы движетесь: Шут**

Шут — карта подлинных новых начинаний. Неопределённость, которую вы назвали — это не проблема, которую нужно решить перед действием. Это сама природа порога.

---

**Позиция 3 — Что требует этот переход: Верховная Жрица**

Верховная Жрица просит прислушаться глубже к тому, что вы уже знаете — прежде чем тянуться за внешним подтверждением.

---

**В итоге**

Фундамент у вас есть. Возможность реальна. Единственное, что стоит между вами и следующим шагом — это разрешение, которое вы ещё не дали себе полностью.`,
    },
  })

  // ─── Демо-сессия (активный async, ожидает ридера) ────────────────────────────
  const reader0Profile = readers[0].readerProfile!
  const pendingSession = await prisma.session.create({
    data: {
      userId: demoClient.id,
      readerId: reader0Profile.id,
      type: SessionType.ASYNC,
      status: SessionStatus.ACTIVE,
    },
  })

  await prisma.order.create({
    data: {
      userId: demoClient.id,
      sessionId: pendingSession.id,
      amount: 120,
      status: OrderStatus.PAID,
    },
  })

  await prisma.asyncReading.create({
    data: {
      sessionId: pendingSession.id,
      status: AsyncReadingStatus.IN_PROGRESS,
    },
  })

  await prisma.message.create({
    data: {
      sessionId: pendingSession.id,
      senderType: SenderType.READER,
      content: 'Добро пожаловать. Я взяла момент, чтобы сосредоточиться с вашим вопросом. Когда будете готовы, расскажите мне немного больше о том, что лежит в сердце того, о чём вы спрашиваете.',
      type: 'TEXT',
    },
  })

  console.log('✅ Seed complete.')
  console.log(`   ${readers.length} читателей создано`)
  console.log('   5 статей создано')
  console.log('   1 демо-клиент создан (client@lumier.com / client123)')
  console.log('   Читатели: *@lumier.com / reader123')
  console.log('   2 демо-сессии созданы')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
