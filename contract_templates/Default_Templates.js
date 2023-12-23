export const contractTemplates = {
  original: {
    font: "serif",
    height: 841.92,
    width: 595.32,
    fontSize: 7,
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
              { type: "text", value: `ДОГОВОР АРЕНДЫ ОБОРУДОВАНИЯ №` },
              { type: "variable", value: "yearTwoDigits", source: "orgData" },
              { type: "text", value: `-` },
              { type: "variable", value: "order_id", source: "orderData" },
            ],
            x: 297.5,
            center: true,
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
            text: [
              { type: "variable", value: "company_type", source: "orgData" },
              { type: "text", value: ' "' },
              { type: "variable", value: "company_name", source: "orgData" },
              { type: "text", value: '" / "' },
              { type: "variable", value: "orgName", source: "orgData" },
              { type: "text", value: '" в лице руководителя ' },
              { type: "variable", value: "supervisor", source: "orgData" },
              { type: "text", value: ", " },
              { type: "text", value: " ИИН:" },
              { type: "variable", value: "kz_paper_bin", source: "orgData" },
              {
                type: "text",
                value:
                  ", именуемый в дальнейшем «Арендодатель» с одной стороны, и ",
              },
            ],
            x: 20,
            width: 555,
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
              { type: "text", value: "ИИН: " },
              {
                type: "variable",
                value: "client_paper_person_id",
                source: "orderData",
              },
              { type: "text", value: ", " },
              {
                type: "variable",
                value: "client_second_name",
                source: "orderData",
              },
              { type: "text", value: " " },
              { type: "variable", value: "client_name", source: "orderData" },
              {
                type: "text",
                value:
                  " именуемый в дальнейшем «Арендатор», с другой стороны, а вместе именуемые Стороны, заключили договор о нижеследующем.",
              },
            ],
            x: 20,
            width: 555,
            weight: 500,
            color: "black",
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
            text: [{ type: "text", value: "1. ПРЕДМЕТ ДОГОВОРА" }],
            x: 297.5,
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
                  "1.1. Арендодатель, из числа своих материальных запасов, предоставляет Арендатору во временное пользование (в аренду, прокат) имущество, инструменты, либо оборудование/я (далее Оборудование) представляющее материальную ценность, сроком и количеством согласно Акту приема-передачи оборудования (Приложение №1), которое является неотъемлемой частью настоящего договора, а Арендатор обязуется уплатить Арендодателю арендную плату и по окончанию срока аренды ему указанное Оборудование в технический исправном состоянии.",
              },
            ],
            x: 20,
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
                  "1.2. Срок временного пользования (далее по договору-аренда) Оборудования исчисляется согласно Акту приема-передачи оборудования (Приложение №1) к настоящему договору.",
              },
            ],
            x: 20,
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
                  "2.1.Оплата предусмотренных настоящим договором сумм согласно Приложения №1 к настоящему договору, осуществляется путем перечисления денежных средств на расчетный счет Арендодателя либо путем внесения наличных денежных средств в кассу Арендодателя.",
              },
            ],
            x: 20,
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
                  "2.2.Арендатор обязан произвести 100% оплату на весь период аренды Оборудования на момент подписания данного договора.",
              },
            ],
            x: 20,
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
                  "2.3.В случае продления срока аренды Арендатор обязан произвести 100% оплату за срок продления аренды Оборудования.",
              },
            ],
            x: 20,
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
                  "3.1.Арендатор обязан использовать полученную в аренду оборудование в соответствии с условиями настоящего Договора и исключительно по прямому производственному и потребительскому назначению названного оборудования.",
              },
            ],
            x: 20,
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
                  "3.2. Арендатор несет возникающие в связи с эксплуатацией арендованного оборудования расходы, в том числе на оплату текущего ремонта и расходуемых в процессе эксплуатации материалов, поддерживает оборудование в исправном, чистом состоянии.",
              },
            ],
            x: 20,
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
                  "3.3. В случае необходимости продления срока аренды Арендатор обязуется заблаговременно уведомить Арендодателя о продлении срока аренды.   Минимальный срок продления 1 (одни) сутки. В случае продления сроков возврата оборудования по истечении срока аренды Арендатором без заблаговременного уведомления Арендодателя, срок аренды оборудования считается продленным по инициативе Арендатора.",
              },
            ],
            x: 20,
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
                  "3.4. Арендатор имеет право вернуть оборудование в случае выявления факта неправильного выбора оборудования либо утраты необходимости в оборудовании в течение 30 (двадцати) минут с момента передачи ему Оборудования по Акту приема-передачи. При этом в случае возвращения Арендатором оборудования ввиду досрочного расторжения договора в течение 30 минут с момента передачи ему оборудования по Акту приема-передачи, ему возвращается 100% (сто процентов) оплаченной суммы. ",
              },
            ],
            x: 20,
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
                  "3.5. В случае порчи, поломки, утери, загрязнения Оборудования Арендатор обязуется восстановить, отремонтировать, очистить (отмыть) Оборудование, т.е. привести в исправное (чистое, рабочее) состояние за свой счет, своими силами, либо по усмотрению и требованию Арендодателя, оплатить полную стоимость оборудования. В случае загрязнения Арендатор обязуется оплатить (на момент возврата Оборудования) Арендодателю за чистку Оборудования в размере 2 000 (две тысячи) тенге. В таком случае срок окончания аренды является дата возврата исправного (восстановленного, отремонтированного, чистого) оборудования либо дата оплаты полной стоимости оборудования согласно Приложению №1 к настоящему Договору и оплаты задолженности по договору.",
              },
            ],
            x: 20,
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
                  "3.6. В случае полной утраты, утери, не возврата оборудования Арендатор обязуется внести полную стоимость оборудования и оплатить просроченную задолженность. В таком случае, датой возврата оборудования считается да та возмещения стоимости оборудования и погашение задолженности по арендным платежам, если таковые имеются.",
              },
            ],
            x: 20,
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
                  "3.7. Арендодатель не несет ответственности за причинение вреда здоровью и имуществу Арендатора и иных лиц в результате использования Арендатором Оборудования в период действия аренды Оборудования. Арендатор подтверждает, что знает правила пользования Оборудованием и технику безопасности и обязуется их соблюдать. Дополнительные средства защиты (спецодежда, перчатки, очки, маски, обувь и т.д.) являются мерой предосторожности, которую обязан обеспечить и соблюдать Арендатор за свой счет.",
              },
            ],
            x: 20,
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
                  "3.8. В случае отказа Арендатора восстановить (отремонтировать) испорченное оборудование, а также в случае отказа возвратить оборудование Арендатор обязуется возместить убытки и ущерб (в том числе арендную плату за весь период ремонта и (или) не возвращения оборудования) причиненный Арендодателю.",
              },
            ],
            x: 20,
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
                  "3.9. В случае неоплаты задолженности по договору (включая оплату по п.3.5) Арендатором на момент возврата оборудования, Арендодатель имеет право не принять оборудование. В этом случае срок аренды считается продленным, и уплачивается Арендатором, согласно установленным настоящим договором ценами и условиями. Минимальный срок продления 1 (одни) сутки.",
              },
            ],
            x: 20,
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
                  "3.10. Уплата пени, штрафа не освобождает Арендатора от исполнения обязательств по п.п. 3.5., 3.6 и оплате за пользование оборудованием. ",
              },
            ],
            x: 20,
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
                  "3.11. В случае невозвращения оборудования и не оплаты стоимости его аренды более 5 календарных дней, данные действия Арендатора расцениваются как односторонний отказ от исполнения условий договора. В этом случае, Арендатор безоговорочно признает задолженность в размере стоимости оборудования и стоимости фактической просрочки по аренде оборудования.",
              },
            ],
            x: 20,
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
                  "При этом, Арендатор признает и дает безусловное согласие на взыскание задолженности (в размере стоимости оборудования, в размере фактической просрочки по аренде оборудования, в совокупности или по отдельности) в приказном порядке, согласен на вынесение судебного приказа.",
              },
            ],
            x: 20,
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
                  "3.12. Подсудность определяется по месту нахождения Арендодателя.",
              },
            ],
            x: 20,
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
                  "5.1. Право пользованием оборудованием возникает у Арендатора после передачи ему оборудования по Акту приема-передачи. С этого момента риск случайной порчи, утраты, утери оборудования лежит на Арендаторе.",
              },
            ],
            x: 20,
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
                  "5.3. Настоящий договор составлен в двух экземплярах, на русском языке, имеющих одинаковую юридическую силу, по одному экземпляру для каждой стороны.",
              },
            ],
            x: 20,
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
                  "5.5.Все спорные вопросы, а так же судебные прочие процессы по данному договору решаются уполномоченными органами относящиеся к району местонахождению Арендодателя.",
              },
            ],
            x: 20,
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
                  "5.6. Подписывая договор, Арендатор дает согласие на обработку своих персональных данных, а также фото и видеосъемку.",
              },
            ],
            x: 20,
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
                value: "Документ №: ",
              },
            ],
            x: 315,
            width: 50,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_paper_serial_number",
                source: "orderData",
              },
            ],
            x: 365,
            width: 210.5,
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
            width: 70,
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
            x: 90,
            width: 192.5,
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
            width: 70,
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
              {
                type: "text",
                value: " - ",
              },
              {
                type: "variable",
                value: "client_paper_givendate",
                source: "orderData",
              },
            ],
            x: 385,
            width: 195.5,
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
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Адрес проживания:",
              },
            ],
            x: 315,
            width: 75,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_city",
                source: "orderData",
              },
              {
                type: "text",
                value: ", ",
              },
              {
                type: "variable",
                value: "client_address",
                source: "orderData",
              },
            ],
            x: 390,
            width: 185.5,
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
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Дата рождения:",
              },
            ],
            x: 315,
            width: 60,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_born_date",
                source: "orderData",
              },
            ],
            x: 375,
            width: 200.5,
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
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Место рождения:",
              },
            ],
            x: 315,
            width: 70,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_born_region",
                source: "orderData",
              },
            ],
            x: 385,
            width: 190.5,
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
                value: "Национальность:",
              },
            ],
            x: 315,
            width: 70,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_nationality",
                source: "orderData",
              },
            ],
            x: 385,
            width: 190.5,
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
                value: "Подпись",
              },
              {
                type: "text",
                value: " __________________ ",
              },
            ],
            x: 20,
            width: 150,
            weight: 600,
            color: "black",
          },
          {
            type: "qrorg",
            x: 140,
            width: 140,
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Подпись",
              },
            ],
            x: 315,
            width: 35,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: " __________________ ",
              },
            ],
            x: 350,
            width: 220.5,
            weight: 600,
            color: "black",
          },
          {
            type: "qrclient",
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
    fontSize: 7,
    contentTemplate: [
      {
        rowItems: [],
        style: {
          bottomMargin: 15,
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
              { type: "variable", value: "yearTwoDigits", source: "orgData" },
              { type: "text", value: "-" },
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
          bottomMargin: 15,
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
            size: 12,
            width: 250,
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
              { type: "variable", value: "city", source: "orgData" },
              { type: "text", value: ", " },
              { type: "variable", value: "address", source: "orgData" },
            ],
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
            x: 20,
            size: 12,
            width: 80,
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
            x: 100,
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
                  "Составили настоящий АКТ, о том что согласно Договору аренды №",
              },
              { type: "variable", value: "yearTwoDigits", source: "orgData" },
              { type: "text", value: "-" },
              { type: "variable", value: "order_id", source: "orderData" },
              { type: "text", value: " от " },
              {
                type: "variable",
                value: "order_started_date",
                source: "orderData",
              },
              {
                type: "text",
                value:
                  " Арендодатель передает, а Арендатор принимает в технически исправном состоянии следующее оборудование/я согласно списку:",
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
            size: 11,
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
                type: "text",
                value:
                  "Итого по списку передается оборудования на общую сумму: ",
              },
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
                  "Подписывая акт приема-передачи оборудования, Арендатор подтверждает, что претензий по количеству, качеству и комплектности не имеет.",
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
                value: "Сумма за аренду: ",
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
                value: "Итого: ",
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
                value: "Срок аренды с: ",
              },
              {
                type: "variable",
                value: "order_started_datetime",
                source: "orderData",
              },
              {
                type: "text",
                value: " До: ",
              },
              {
                type: "variable",
                value: "order_planned_datetime",
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
          bottomMargin: 15,
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
            size: 12,
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
                value: "Документ №: ",
              },
            ],
            x: 315,
            width: 50,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_paper_serial_number",
                source: "orderData",
              },
            ],
            x: 365,
            width: 210.5,
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
            width: 70,
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
            x: 90,
            width: 192.5,
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
            width: 70,
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
              {
                type: "text",
                value: " - ",
              },
              {
                type: "variable",
                value: "client_paper_givendate",
                source: "orderData",
              },
            ],
            x: 385,
            width: 195.5,
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
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Адрес проживания:",
              },
            ],
            x: 315,
            width: 75,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_city",
                source: "orderData",
              },
              {
                type: "text",
                value: ", ",
              },
              {
                type: "variable",
                value: "client_address",
                source: "orderData",
              },
            ],
            x: 390,
            width: 185.5,
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
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Дата рождения:",
              },
            ],
            x: 315,
            width: 60,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_born_date",
                source: "orderData",
              },
            ],
            x: 375,
            width: 200.5,
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
            weight: 500,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Место рождения:",
              },
            ],
            x: 315,
            width: 70,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_born_region",
                source: "orderData",
              },
            ],
            x: 385,
            width: 190.5,
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
                value: "Национальность:",
              },
            ],
            x: 315,
            width: 70,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "variable",
                value: "client_nationality",
                source: "orderData",
              },
            ],
            x: 385,
            width: 190.5,
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
                value: "Подпись",
              },
              {
                type: "text",
                value: " __________________ ",
              },
            ],
            x: 20,
            width: 150,
            weight: 600,
            color: "black",
          },
          {
            type: "qrorg",
            x: 140,
            width: 140,
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: "Подпись",
              },
            ],
            x: 315,
            width: 35,
            weight: 600,
            color: "black",
          },
          {
            type: "text",
            text: [
              {
                type: "text",
                value: " __________________ ",
              },
            ],
            x: 350,
            width: 220.5,
            weight: 600,
            color: "black",
          },
          {
            type: "qrclient",
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
