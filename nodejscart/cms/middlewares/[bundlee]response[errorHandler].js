const inspect = require("util").inspect;
import { appContext } from "../../../lib/context/app";
import { renderToString } from "react-dom/server";
import React from "react";
import Html from "../../../lib/components/html";

module.exports = async function (request, response, stack, next) {
    let promises = [];
    for (let id in stack) {
        // Check if middleware is async
        if (Promise.resolve(stack[id]) === stack[id])
            promises.push(stack[id]);
    }
    try {
        // Wait for all async middleware to be completed
        await Promise.all(promises);

        // Check if this is a redirection or not.
        if (response.$redirectUrl) {
            response.redirect(response.statusCode || 302, response.$redirectUrl)
        }
        // Check if the response is Json or not.
        else if (response.get('Content-Type') === "application/json; charset=utf-8") {
            response.json(response.$body || {});
        } else {
            // Check if `$body` is empty or not. If yes, we consider the content is already generated by previous middleware
            if (response.$body && response.$body !== "") {
                response.send(response.$body);
            } else {
                response.context.widgets = response.getComponents();
                //resetServerContext();
                let source = renderToString(<appContext.Provider value={{ data: response.context }}><Html /></appContext.Provider>);
                delete response.context.widgets;
                source = source.replace("</head>", "<script>var appContext = " + inspect(response.context, { depth: 10, maxArrayLength: null }) + "</script></head>");
                response.send(`<!DOCTYPE html><html id="root">${source}</html>`);
            }
        }
    } catch (error) {
        next(error);
    }
}