export const contractTemplates = {
  original: {
    font: "serif",
    height: 841.92,
    width: 595.32,
    contentTemplate: [
      {
        rowItems: [],
        style: {
          bottomMargin: 20,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              { type: "text", value: "ДОГОВОР АРЕНДЫ ОБОРУДОВАНИЯ №23-00457" },
              { type: "variable", value: "order_id", source: "orderData" },
            ],
            x: 297.5,
            center: true,
            size: 9,
            width: 550,
            weight: 600,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              { type: "text", value: "г. " },
              { type: "variable", value: "city", source: "orgData" },
            ],
            x: 20,
            size: 9,
            width: 150,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "order_started_date",
                source: "orderData",
              },
            ],
            x: 500,
            size: 9,
            width: 75,
            weight: 600,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [{ type: "text", value: "Арендодатель: " }],
            x: 20,
            size: 9,
            width: 70,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              { type: "variable", value: "company_type", source: "orgData" },
              { type: "text", value: ' "' },
              { type: "variable", value: "company_name", source: "orgData" },
              { type: "text", value: '" ' },
              { type: "text", value: "в лице руководителя " },
              { type: "variable", value: "supervisor", source: "orgData" },
              { type: "text", value: ", с одной стороны, и" },
            ],
            x: 90,
            size: 9,
            width: 410,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [{ type: "text", value: "Арендатор:" }],
            x: 20,
            size: 9,
            width: 60,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_second_name",
                source: "orderData",
              },
              { type: "text", value: " " },
              { type: "variable", value: "client_name", source: "orderData" },
              { type: "text", value: " " },
              {
                type: "variable",
                value: "client_father_name",
                source: "orderData",
              },
            ],
            x: 80,
            size: 9,
            width: 375,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 15,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            center: true,
            text: [{ type: "text", value: "1. ПРЕДМЕТ ДОГОВОРА" }],
            x: 297.5,
            size: 9,
            width: 250,
            weight: 600,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "1.1.Арендодатель, из числа своих материальных запасов, предоставляет Арендатору во временное пользование (в аренду, на прокат) а Арендатор обязуется уплатить Арендодателю арендную плату и по окончании срока аренды вернуть ему указанное оборудование в технический исправном состоянии.",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 5,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            center: true,
            text: [{ type: "text", value: "2. ПОРЯДОК РАСЧЕТОВ" }],
            x: 297.5,
            size: 9,
            width: 250,
            weight: 600,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "2.1.Оплата предусмотренных настоящим договорам сумм, согласно Приложения № 1 к договору № ",
              },
              { type: "variable", value: "order_id", source: "orderData" },
              {
                type: "text",
                value: " , от ",
              },
              {
                value: "order_started_datetime",
                type: "variable",
                source: "orderData",
              },
              {
                type: "text",
                value:
                  ". К настоящему договору, осуществляется путем перечисления денежных средств на расчетный счет Арендодателя либо путем внесения наличных денежных средств в кассу Арендодателя.",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "2.2 Арендатор обязан произвести 100% предоплату на весь период аренды оборудования.",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "2.3.В случае продления срока аренды Арендатор обязан произвести 100% предоплату за срок продления аренды оборудования.",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 600,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 5,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            center: true,
            text: [{ type: "text", value: "3. ОТВЕТСТВЕННОСТЬ СТОРОН" }],
            x: 297.5,
            size: 9,
            width: 250,
            weight: 600,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "3.1. Арендатор обязан использовать полученное в аренду оборудование в соответствии с условиями настоящего договора и исключительно по прямому производственному и потребительскому назначению названного оборудования.",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "3.2. Арендатор несет возникающие в связи с эксплуатацией арендованного оборудование расходы, в том числе на оплату текущего ремонта и расходуемых в процессе эксплуатации материалов, поддерживает оборудование в исправном, чистом состоянии.",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "3.3. В случае нарушения сроков возврата оборудования по истечении срока аренды Арендатором, срок аренды оборудования считается продленным по инициативе Арендатора и уплачивается Арендатором согласно установленными настоящим договором, ценами и условиями. Минимальный срок продления 1(одни) сутки",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "3.4. Арендатор имеет право вернуть оборудование в случае выявления факта неправильного выбора оборудования либо утраты необходимости в оборудовании в течении 20 (двадцати) минут с момента передачи ему оборудования по Акту приема-передачи.",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "3.5. В случае полной утраты, утери, не возврата оборудования Арендодателю, Арендатор обязуется внести полную стоимость оборудования. В таком случае датой возврата оборудования и прекращение действия договора считается дата внесения денежных средств, в размере полной стоимости оборудования, согласно Приложения №1 настоящего договора, и оплаты задолженности по договору (если таковые имеются). ",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "3.6. В случае отказа Арендатора восстанавливать (отремонтировать) испорченное (поломанное) оборудование Арендатор обязуется возместить убытки и ущерб (в том числе арендную плату за весь период ремонта оборудования) причиненный Арендодателю. ",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 600,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "3.7. В случае неоплаты задолженности по договору Арендатором на момент возврата оборудовании, Арендодатель имеет право не принять оборудование. В этом случае срок аренды считается продленным, и уплачивается Арендатором согласно установленным настоящим договором ценами и условиями . Минимальный срок продления 1(одни) сутки.",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 5,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            center: true,
            text: [{ type: "text", value: "4. ДОСТАВКА ОБОРУДОВАНИЯ" }],
            x: 297.5,
            size: 9,
            width: 250,
            weight: 600,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "4.1. Арендатор должен оповестить Арендодателя о желании вернуть оборудование посредством службы доставки Арендодателя не позднее 3 часов до времени планируемой сдачи оборудования (написав в WhatsApp , или позвонить на номер ",
              },
              { type: "variable", value: "cellphone", source: "orgData" },
              { type: "text", value: ", c " },
              { type: "variable", value: "work_open_time", source: "orgData" },
              { type: "text", value: " до " },
              { type: "variable", value: "work_close_time", source: "orgData" },
              {
                type: "text",
                value:
                  " ). Арендодатель имеет право отказать в вызове оборудования, в силу технической невозможности, наличии задолженности по арендной плате, а также по иным обоснованным причинам. В таком случае Арендатор возвращает оборудование своими силами. ",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 5,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            center: true,
            text: [{ type: "text", value: "5. ЗАКЛЮЧИТЕЛЬНАЯ ЧАСТЬ" }],
            x: 297.5,
            size: 9,
            width: 250,
            weight: 600,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "5.1. Право пользованием оборудованием возникает у Арендатора после передачи ему оборудования по Акту приема-передачи. С этого момента риск случайной гибели, порчи, утраты, утери оборудования лежит на Арендаторе. ",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "5.2. Арендатор несет полную ответственность за выбор того или иного оборудования",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "5.3. Настоящий договор составлен в двух экземплярах, на русском языке, имеющих одинаковую юридическую силу, по одному экземпляру для каждой стороны. ",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "5.4. Во всем остальном, что не предусмотрено настоящим договором стороны руководствуются действующим законодательством РК",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "5.5. Все спорные вопросы, а так же судебные прочие процессы по данному договору решаются уполномоченными органами относящиеся к району местонахождению Арендодателя.",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "5.6. Подписывая договор, Арендатор дает согласие на обработку своих персональных данных, а также фото и видеосъемку",
              },
            ],
            x: 20,
            size: 9,
            width: 555,
            weight: 500,
            color: "black",
            fill: true,
          },
        ],
        style: {
          bottomMargin: 5,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            center: true,
            text: [{ type: "text", value: "6. АДРЕСА И РЕКВИЗИТЫ СТОРОН" }],
            x: 297.5,
            size: 9,
            width: 250,
            weight: 600,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "company_type",
                source: "orgData",
              },
            ],
            x: 20,
            width: 20,
            size: 9,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "«",
              },
              {
                type: "variable",
                value: "company_name",
                source: "orgData",
              },
              {
                type: "text",
                value: "»",
              },
            ],
            x: 42,
            width: 240.5,
            size: 9,
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "ФИО: ",
              },
            ],
            x: 315,
            width: 30,
            size: 9,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_second_name",
                source: "orderData",
              },
              { type: "text", value: " " },
              { type: "variable", value: "client_name", source: "orderData" },
              { type: "text", value: " " },
              {
                type: "variable",
                value: "client_father_name",
                source: "orderData",
              },
            ],
            x: 345,
            width: 230.5,
            size: 9,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "БИН",
              },
            ],
            x: 20,
            width: 30,
            size: 9,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "kz_paper_bin",
                source: "orgData",
              },
            ],
            x: 50,
            width: 232.5,
            size: 9,
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "ИИН: ",
              },
            ],
            x: 315,
            width: 30,
            size: 9,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_paper_person_id",
                source: "orderData",
              },
            ],
            x: 345,
            width: 230.5,
            size: 9,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Удостоверение личности №: ",
              },
            ],
            x: 315,
            width: 130,
            size: 9,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_paper_person_id",
                source: "orderData",
              },
            ],
            x: 445,
            width: 130.5,
            size: 9,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Тел. / WhatsApp:",
              },
            ],
            x: 20,
            width: 80,
            size: 9,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "cellphone",
                source: "orgData",
              },
            ],
            x: 100,
            width: 182.5,
            size: 9,
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Документ выдан:",
              },
            ],
            x: 315,
            width: 85,
            size: 9,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_paper_authority",
                source: "orderData",
              },
            ],
            x: 400,
            width: 175.5,
            size: 9,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Адрес:",
              },
            ],
            x: 20,
            width: 35,
            size: 9,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "city",
                source: "orgData",
              },
              {
                type: "text",
                value: ", ",
              },
              {
                type: "variable",
                value: "address",
                source: "orgData",
              },
            ],
            x: 55,
            width: 227.5,
            size: 9,
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Адрес:",
              },
            ],
            x: 315,
            width: 35,
            size: 9,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_address",
                source: "orderData",
              },
            ],
            x: 350,
            width: 225.5,
            size: 9,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "ИИК:",
              },
            ],
            x: 20,
            width: 35,
            size: 9,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "kz_paper_iik",
                source: "orgData",
              },
            ],
            x: 55,
            width: 227.5,
            size: 9,
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Телефон:",
              },
            ],
            x: 315,
            width: 45,
            size: 9,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_cellphone",
                source: "orderData",
              },
            ],
            x: 360,
            width: 215.5,
            size: 9,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "БИК:",
              },
            ],
            x: 20,
            width: 40,
            size: 14,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "kz_paper_bik",
                source: "orgData",
              },
            ],
            x: 60,
            width: 222.5,
            size: 14,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "bank_company_type",
                source: "orgData",
              },
            ],
            x: 20,
            width: 20,
            size: 9,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "bank_company_name",
                source: "orgData",
              },
            ],
            x: 40,
            width: 245.5,
            size: 9,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 10,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Руководитель",
              },
              {
                type: "text",
                value: " _______________ ",
              },
            ],
            x: 20,
            width: 150,
            size: 9,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "supervisor_short",
                source: "orgData",
              },
            ],
            x: 170,
            width: 115.2,
            size: 9,
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Подпись Фамилия",
              },
            ],
            x: 315,
            width: 55,
            size: 9,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: " _______________ ",
              },
            ],
            x: 370,
            width: 200.5,
            size: 9,
            weight: 600,
            color: "black",
          },
          {
            type: "qr",
            x: 450,
            width: 140,
          },
        ],
        style: {
          bottomMargin: 20,
        },
      },
    ],
  },
};

export const actTemplates = {
  original: {
    font: "serif",
    height: 841.92,
    width: 595.32,
    padding: 20,
    contentTemplate: [
      {
        rowItems: [],
        style: {
          bottomMargin: 20,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [{ type: "text", value: "Приложение №1" }],
            x: 20,
            size: 12,
            width: 150,
            weight: 500,
            color: "black",
          },
          {
            center: true,
            type: "text",
            text: [
              { type: "text", value: "к договору №" },
              { type: "variable", value: "order_id", source: "orderData" },
              { type: "text", value: " от " },
              {
                type: "variable",
                value: "order_started_date",
                source: "orderData",
              },
            ],
            x: 490.32,
            size: 12,
            width: 150,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 40,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            center: true,
            text: [{ type: "text", value: "АКТ" }],
            x: 297.5,
            size: 12,
            width: 150,
            weight: 600,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            center: true,
            text: [{ type: "text", value: "Приема-передачи оборудования" }],
            x: 297.5,
            size: 17,
            width: 250,
            weight: 600,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 20,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [{ type: "variable", value: "address", source: "orgData" }],
            x: 20,
            size: 12,
            width: 250,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [{ type: "text", value: "Мы, нижеподписавшиеся:" }],
            x: 20,
            size: 12,
            width: 250,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [{ type: "text", value: "1. " }],
            x: 40,
            size: 12,
            width: 20,
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [{ type: "text", value: "Арендодатель: " }],
            x: 60,
            size: 12,
            width: 100,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              { type: "variable", value: "company_type", source: "orgData" },
              { type: "text", value: ' "' },
              { type: "variable", value: "company_name", source: "orgData" },
              { type: "text", value: '" ' },
              { type: "text", value: "в лице руководителя " },
              { type: "variable", value: "supervisor", source: "orgData" },
              { type: "text", value: ", с одной стороны, и" },
            ],
            x: 160,
            size: 12,
            width: 410,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [{ type: "text", value: "Арендатор:" }],
            x: 20,
            size: 12,
            width: 80,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_second_name",
                source: "orderData",
              },
              { type: "text", value: " " },
              { type: "variable", value: "client_name", source: "orderData" },
              { type: "text", value: " " },
              {
                type: "variable",
                value: "client_father_name",
                source: "orderData",
              },
            ],
            x: 100,
            size: 12,
            width: 375,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 20,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "Составили настоящий АКТ, о том что, согласно Договора аренды №",
              },
              { type: "variable", value: "order_id", source: "orderData" },
              { type: "text", value: " от " },
              {
                type: "variable",
                value: "order_started_datetime",
                source: "orderData",
              },
              {
                type: "text",
                value:
                  " Арендодатель передает, а Арендатор принимает в техническом исправном состоянии, следующее оборудование/я согласно списку:",
              },
            ],
            x: 20,
            size: 12,
            width: 555,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 10,
        },
      },
      {
        rowItems: [
          {
            type: "table",
            border: "1px solid gray",
            index: true,
            schema: [
              { title: "Наименование", key: "name", width: 250 },
              { title: "Инв. номер", key: "code", center: true, width: 100 },
              {
                title: [
                  { type: "text", value: "Цена (" },
                  {
                    type: "variable",
                    value: "tariff_units",
                    source: "orderData",
                  },
                  { type: "text", value: ")" },
                ],
                key: "price",
                center: true,
                width: 85,
              },
              {
                title: [
                  { type: "text", value: "Стоимость оборудования, " },
                  {
                    type: "variable",
                    value: "currency",
                    source: "orgData",
                  },
                ],
                key: "compensation_price",
                center: true,
                width: 85,
              },
            ],
            variable: "goods",
            source: "orderData",
            x: 20,
            size: 13,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 30,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [{ type: "text", value: "ИТОГО:" }],
            x: 20,
            width: 100,
            size: 12,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              { type: "text", value: "Итого по списку 1, на общую сумму: " },
              {
                type: "variable",
                value: "compensation_sum",
                source: "orderData",
              },
              { type: "variable", value: "currency", source: "orgData" },
            ],
            x: 20,
            width: 555,
            size: 12,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 10,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value:
                  "3. Подписывая акт приема-передачи оборудования, Арендатор подтверждает, что претензий по количеству, качеству и комплектности не имеет.",
              },
            ],
            x: 20,
            width: 555,
            size: 12,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 10,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Итого общая сумма за аренду: ",
              },
              {
                type: "variable",
                value: "sum",
                source: "orderData",
              },
              {
                type: "variable",
                value: "currency",
                source: "orgData",
              },
            ],
            x: 20,
            width: 555,
            size: 12,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Скидка: ",
              },
              {
                type: "variable",
                value: "discount",
                source: "orderData",
              },
              {
                type: "variable",
                value: "currency",
                source: "orgData",
              },
            ],
            x: 20,
            width: 555,
            size: 12,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Оплачено за аренду: ",
              },
              {
                type: "variable",
                value: "payment_sum",
                source: "orderData",
              },
              {
                type: "variable",
                value: "currency",
                source: "orgData",
              },
            ],
            x: 20,
            width: 555,
            size: 12,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Уплачено до: ",
              },
              {
                type: "variable",
                value: "order_planned_date",
                source: "orderData",
              },
            ],
            x: 20,
            width: 555,
            size: 12,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 20,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Адреса и реквизиты сторон",
              },
            ],
            center: true,
            x: 297.5,
            width: 555,
            size: 18,
            weight: 600,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 15,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "company_type",
                source: "orgData",
              },
            ],
            x: 20,
            width: 20,
            size: 10,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "«",
              },
              {
                type: "variable",
                value: "company_name",
                source: "orgData",
              },
              {
                type: "text",
                value: "»",
              },
            ],
            x: 42,
            width: 240.5,
            size: 10,
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "ФИО: ",
              },
            ],
            x: 315,
            width: 30,
            size: 10,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_second_name",
                source: "orderData",
              },
              { type: "text", value: " " },
              { type: "variable", value: "client_name", source: "orderData" },
              { type: "text", value: " " },
              {
                type: "variable",
                value: "client_father_name",
                source: "orderData",
              },
            ],
            x: 345,
            width: 230.5,
            size: 10,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "БИН",
              },
            ],
            x: 20,
            width: 30,
            size: 10,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "kz_paper_bin",
                source: "orgData",
              },
            ],
            x: 50,
            width: 232.5,
            size: 10,
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "ИИН: ",
              },
            ],
            x: 315,
            width: 30,
            size: 10,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_paper_person_id",
                source: "orderData",
              },
            ],
            x: 345,
            width: 230.5,
            size: 10,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Удостоверение личности №: ",
              },
            ],
            x: 315,
            width: 130,
            size: 10,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_paper_person_id",
                source: "orderData",
              },
            ],
            x: 445,
            width: 130.5,
            size: 10,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Тел. / WhatsApp:",
              },
            ],
            x: 20,
            width: 80,
            size: 10,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "cellphone",
                source: "orgData",
              },
            ],
            x: 100,
            width: 182.5,
            size: 10,
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Документ выдан:",
              },
            ],
            x: 315,
            width: 85,
            size: 10,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_paper_authority",
                source: "orderData",
              },
            ],
            x: 400,
            width: 175.5,
            size: 10,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Адрес:",
              },
            ],
            x: 20,
            width: 35,
            size: 10,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "city",
                source: "orgData",
              },
              {
                type: "text",
                value: ", ",
              },
              {
                type: "variable",
                value: "address",
                source: "orgData",
              },
            ],
            x: 55,
            width: 227.5,
            size: 10,
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Адрес:",
              },
            ],
            x: 315,
            width: 35,
            size: 10,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_address",
                source: "orderData",
              },
            ],
            x: 350,
            width: 225.5,
            size: 10,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "ИИК:",
              },
            ],
            x: 20,
            width: 35,
            size: 10,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "kz_paper_iik",
                source: "orgData",
              },
            ],
            x: 55,
            width: 227.5,
            size: 10,
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Телефон:",
              },
            ],
            x: 315,
            width: 45,
            size: 10,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_cellphone",
                source: "orderData",
              },
            ],
            x: 360,
            width: 215.5,
            size: 10,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "БИК:",
              },
            ],
            x: 20,
            width: 40,
            size: 12,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "kz_paper_bik",
                source: "orgData",
              },
            ],
            x: 60,
            width: 222.5,
            size: 12,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 0,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "bank_company_type",
                source: "orgData",
              },
            ],
            x: 20,
            width: 20,
            size: 10,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "bank_company_name",
                source: "orgData",
              },
            ],
            x: 40,
            width: 245.5,
            size: 10,
            weight: 500,
            color: "black",
          },
        ],
        style: {
          bottomMargin: 10,
        },
      },
      {
        rowItems: [
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Руководитель",
              },
              {
                type: "text",
                value: " _______________ ",
              },
            ],
            x: 20,
            width: 150,
            size: 10,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "supervisor_short",
                source: "orgData",
              },
            ],
            x: 170,
            width: 115.2,
            size: 10,
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Подпись Фамилия",
              },
            ],
            x: 315,
            width: 55,
            size: 10,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: " _______________ ",
              },
            ],
            x: 370,
            width: 200.5,
            size: 10,
            weight: 600,
            color: "black",
          },
          {
            type: "qr",
            x: 450,
            width: 140,
          },
        ],
        style: {
          bottomMargin: 20,
        },
      },
    ],
  },
};
